import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { memoryStore, DEFAULT_SHOP } from './db';
import { Product, TokenReservation } from '../../shared/types';
import {
  verifyServerTOTP,
  createZeroTrustSessionToken,
  verifyZeroTrustSessionToken,
  getOtpAuthUrl,
  signTokenQrPayload,
  verifyTokenQrSignature
} from './security';

interface Env {
  DB?: any;
  ADMIN_TOTP_SECRET?: string;
  ADMIN_EMERGENCY_PASSCODE?: string;
  ADMIN_SESSION_SECRET?: string;
}

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend applications (Customer App & Merchant Portal)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'X-Admin-Key']
}));

// Helper for safe JSON body parsing
async function getJsonBody<T = any>(c: any): Promise<T> {
  try {
    return await c.req.json();
  } catch (e) {
    return {} as T;
  }
}

// Helpers for D1 Object Mapping
function mapDbProduct(row: any): Product {
  return {
    id: row.id,
    title: row.title,
    description: row.description || '',
    category: row.category,
    gender: row.gender,
    size: row.size,
    originalPrice: Number(row.original_price),
    discountedPrice: Number(row.discounted_price),
    cashbackAmount: Number(row.cashback_amount),
    totalQuantity: Number(row.total_quantity),
    availableQuantity: Number(row.available_quantity),
    imageUrl: row.image_url,
    status: row.status,
    createdAt: row.created_at
  };
}

function mapDbToken(row: any): TokenReservation {
  return {
    id: row.id,
    qrPayload: row.qr_payload,
    userId: row.user_id,
    userEmail: row.user_email,
    userName: row.user_name,
    userPhone: row.user_phone || '',
    productId: row.product_id,
    productTitle: row.product_title,
    productSize: row.product_size,
    productImage: row.product_image,
    originalPrice: Number(row.original_price),
    discountedPrice: Number(row.discounted_price),
    cashbackAmount: Number(row.cashback_amount),
    finalPayableAmount: Number(row.final_payable_amount),
    status: row.status,
    bookedAt: row.booked_at,
    expiresAt: row.expires_at,
    claimedAt: row.claimed_at || undefined
  };
}

// Health & Root
app.get('/', (c) => {
  return c.json({
    name: 'Cloth Shop O2O Clearance API',
    status: 'ONLINE',
    version: '1.2.0',
    database: c.env?.DB ? 'Cloudflare D1 (Connected)' : 'In-Memory Fallback',
    timestamp: new Date().toISOString()
  });
});

// 1. Get Shop Details
app.get('/api/shop', (c) => {
  return c.json({ success: true, shop: DEFAULT_SHOP });
});

// ============================================================================
// ZERO-TRUST ADMIN AUTHENTICATION (Google Authenticator RFC 6238 TOTP Engine)
// All secrets stored in Cloudflare Worker Environment Variables ([vars] / secrets)
// ============================================================================

// 1.0.1 Verify Google Authenticator 6-Digit TOTP or Emergency Bypass Code
app.post('/api/admin/verify-totp', async (c) => {
  try {
    const body = await getJsonBody(c);
    const { code } = body;

    if (!code || typeof code !== 'string') {
      return c.json({ success: false, error: 'Authenticator code is required.' }, 400);
    }

    // Read secrets directly from Cloudflare Worker Environment
    const secret = c.env?.ADMIN_TOTP_SECRET || 'KRDG4ZDPNU6T2ZLS';
    const emergencyPasscode = c.env?.ADMIN_EMERGENCY_PASSCODE || 'SD-2026-DURGA';
    const sessionSecret = c.env?.ADMIN_SESSION_SECRET || 'SHREE_DURGA_ZERO_TRUST_SECRET_KEY_2026_CLOUDFLARE';

    const isValid = await verifyServerTOTP(code, secret, emergencyPasscode);
    if (!isValid) {
      return c.json({
        success: false,
        error: 'Incorrect Authenticator code. Check your Google Authenticator app and try again.'
      }, 401);
    }

    // Generate cryptographically signed HMAC-SHA256 Zero-Trust Session Token (12-hr validity)
    const { token, expiresAt } = await createZeroTrustSessionToken(sessionSecret, 12);

    return c.json({
      success: true,
      message: 'Zero-Trust Authenticator verification successful!',
      token,
      expiresAt,
      shop: 'Shree Durga Cloth Store'
    });
  } catch (err: any) {
    console.error('Server TOTP verification error:', err);
    return c.json({ success: false, error: 'Internal server error during verification' }, 500);
  }
});

// 1.0.2 Fetch QR Code Setup Config (Read directly from Cloudflare Worker Env)
app.get('/api/admin/setup-qr', async (c) => {
  const secret = c.env?.ADMIN_TOTP_SECRET || 'KRDG4ZDPNU6T2ZLS';
  const otpauthUrl = getOtpAuthUrl(secret, 'CounterAdmin', 'Shree Durga Cloth Store');
  return c.json({
    success: true,
    secret,
    otpauthUrl
  });
});

// 1.0.3 Verify Active Admin Session Token
app.get('/api/admin/verify-session', async (c) => {
  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, valid: false, error: 'No session token provided' }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const sessionSecret = c.env?.ADMIN_SESSION_SECRET || 'SHREE_DURGA_ZERO_TRUST_SECRET_KEY_2026_CLOUDFLARE';
  const isValid = await verifyZeroTrustSessionToken(token, sessionSecret);

  if (!isValid) {
    return c.json({ success: false, valid: false, error: 'Admin session expired or invalid' }, 401);
  }

  return c.json({ success: true, valid: true });
});

// 1.1 Google Sign-In & User Sync
app.post('/api/auth/google', async (c) => {
  try {
    const body = await getJsonBody(c);
    const { credential, email, name, avatarUrl, id, phone } = body;

    let userEmail = email;
    let userName = name;
    let userAvatar = avatarUrl;
    let userId = id;

    // Decode Google JWT payload if provided
    if (credential && typeof credential === 'string') {
      try {
        const parts = credential.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
          if (payload.email) userEmail = payload.email;
          if (payload.name) userName = payload.name;
          if (payload.picture) userAvatar = payload.picture;
          if (payload.sub) userId = `google-${payload.sub}`;
        }
      } catch (jwtErr) {
        console.warn('Failed to parse JWT payload', jwtErr);
      }
    }

    if (!userEmail) {
      return c.json({ success: false, error: 'Email is required for Google authentication.' }, 400);
    }

    const user = {
      id: userId || `user-${Date.now()}`,
      email: userEmail,
      name: userName || userEmail.split('@')[0],
      avatarUrl: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userName || userEmail)}`,
      phone: phone || '',
      totalCashbackEarned: 0,
      activeTokensCount: 0
    };

    // If Cloudflare D1 database binding is present, upsert into users table
    if (c.env?.DB) {
      try {
        await c.env.DB.prepare(`
          INSERT INTO users (id, email, name, avatar_url, phone)
          VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(email) DO UPDATE SET
            name = excluded.name,
            avatar_url = excluded.avatar_url,
            phone = COALESCE(NULLIF(excluded.phone, ''), users.phone)
        `).bind(user.id, user.email, user.name, user.avatarUrl, user.phone).run();

        // Count active tokens
        const tokenCount = await c.env.DB.prepare(`
          SELECT count(*) as count FROM tokens 
          WHERE user_email = ? AND status = 'ACTIVE' AND datetime(expires_at) > datetime('now')
        `).bind(user.email).first();
        if (tokenCount) user.activeTokensCount = tokenCount.count;
      } catch (dbErr) {
        console.warn('D1 user upsert notice:', dbErr);
      }
    } else {
      user.activeTokensCount = memoryStore.getUserActiveTokensCount(userEmail);
    }

    return c.json({
      success: true,
      message: 'Google Sign-In verified successfully',
      user
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Authentication failed' }, 500);
  }
});

// 2. Get Public Products Catalog (Cloudflare D1 with in-memory fallback)
app.get('/api/products', async (c) => {
  const category = c.req.query('category');
  const gender = c.req.query('gender');
  const size = c.req.query('size');
  const search = c.req.query('search');

  if (c.env?.DB) {
    try {
      let query = 'SELECT * FROM products WHERE 1=1';
      const params: any[] = [];

      if (category && category !== 'All') {
        query += ' AND category = ?';
        params.push(category);
      }
      if (gender && gender !== 'All') {
        query += ' AND (gender = ? OR gender = "Unisex")';
        params.push(gender);
      }
      if (size && size !== 'All') {
        query += ' AND size = ?';
        params.push(size);
      }
      if (search && search.trim()) {
        query += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
        const term = `%${search.trim()}%`;
        params.push(term, term, term);
      }
      query += ' ORDER BY created_at DESC';

      const res = await c.env.DB.prepare(query).bind(...params).all();
      if (res?.results) {
        const products = res.results.map(mapDbProduct);
        return c.json({ success: true, count: products.length, products });
      }
    } catch (e: any) {
      console.warn('D1 query failed, using memory store fallback', e);
    }
  }

  const products = memoryStore.getProducts({ category, gender, size, search });
  return c.json({ success: true, count: products.length, products });
});

// 3. Get Single Product
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');

  if (c.env?.DB) {
    try {
      const row = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
      if (row) {
        return c.json({ success: true, product: mapDbProduct(row) });
      }
    } catch (e) {
      console.warn('D1 product fetch error', e);
    }
  }

  const product = memoryStore.getProductById(id);
  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, product });
});

// 4. Customer: Book 24-Hour Clearance Token (Atomic D1 reservation)
app.post('/api/tokens/book', async (c) => {
  try {
    const body = await getJsonBody(c);
    const { productId, userId, userEmail, userName, userPhone } = body;

    if (!productId || !userEmail) {
      return c.json({ success: false, error: 'Missing required fields: productId and userEmail are required.' }, 400);
    }

    if (c.env?.DB) {
      try {
        // Auto expire outdated tokens first
        await c.env.DB.prepare(`
          UPDATE tokens SET status = 'EXPIRED' 
          WHERE status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
        `).run();

        // 1. Check anti-hoarding rule (max 2 active tokens)
        const activeRes = await c.env.DB.prepare(`
          SELECT count(*) as count FROM tokens 
          WHERE user_email = ? AND status = 'ACTIVE' AND datetime(expires_at) > datetime('now')
        `).bind(userEmail).first();

        if (activeRes && activeRes.count >= 2) {
          return c.json({ 
            success: false, 
            error: 'Anti-hoarding limit: You already have 2 active reservations. Please visit store or cancel one from My Tokens.' 
          }, 400);
        }

        // 2. Check available stock
        const prod = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(productId).first();
        if (!prod || prod.available_quantity <= 0) {
          return c.json({ success: false, error: 'Sorry! This clearance item is already booked or sold out.' }, 400);
        }

        // 3. Decrement available stock
        const newAvail = prod.available_quantity - 1;
        const newStatus = newAvail <= 0 ? 'SOLD_OUT' : 'AVAILABLE';
        await c.env.DB.prepare(`
          UPDATE products SET available_quantity = ?, status = ? WHERE id = ?
        `).bind(newAvail, newStatus, productId).run();

        // 4. Create Token with Cryptographic HMAC Signature
        const randomDigits = Math.floor(100000 + Math.random() * 900000);
        const tokenId = `TK-${randomDigits}`;
        const now = new Date();
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
        const finalPayable = prod.discounted_price - prod.cashback_amount;
        const sessionSecret = c.env?.ADMIN_SESSION_SECRET || 'SHREE_DURGA_ZERO_TRUST_SECRET_KEY_2026_CLOUDFLARE';
        const qrPayload = await signTokenQrPayload(tokenId, productId, finalPayable, sessionSecret);

        await c.env.DB.prepare(`
          INSERT INTO tokens (
            id, qr_payload, user_id, user_email, user_name, user_phone, 
            product_id, product_title, product_size, product_image, 
            original_price, discounted_price, cashback_amount, final_payable_amount, 
            status, booked_at, expires_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ACTIVE', ?, ?)
        `).bind(
          tokenId, qrPayload, userId || `user-${Date.now()}`, userEmail, userName || userEmail.split('@')[0], userPhone || '',
          productId, prod.title, prod.size, prod.image_url, prod.original_price, prod.discounted_price, prod.cashback_amount, finalPayable,
          now.toISOString(), expiresAt
        ).run();

        const token: TokenReservation = {
          id: tokenId,
          qrPayload,
          userId: userId || `user-${Date.now()}`,
          userEmail,
          userName: userName || userEmail.split('@')[0],
          userPhone: userPhone || '',
          productId,
          productTitle: prod.title,
          productSize: prod.size,
          productImage: prod.image_url,
          originalPrice: prod.original_price,
          discountedPrice: prod.discounted_price,
          cashbackAmount: prod.cashback_amount,
          finalPayableAmount: finalPayable,
          status: 'ACTIVE',
          bookedAt: now.toISOString(),
          expiresAt
        };

        return c.json({
          success: true,
          message: 'Token booked successfully! Valid for 24 hours.',
          token
        });
      } catch (dbErr: any) {
        console.error('D1 booking error:', dbErr);
      }
    }

    // In-memory fallback
    const result = memoryStore.bookToken({
      productId,
      userId: userId || `user-${Date.now()}`,
      userEmail,
      userName: userName || userEmail.split('@')[0],
      userPhone: userPhone || ''
    });

    if (!result.success) {
      return c.json({ success: false, error: result.error }, 400);
    }

    return c.json({
      success: true,
      message: 'Token booked successfully! Valid for 24 hours.',
      token: result.token
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Internal server error' }, 500);
  }
});

// 5. Customer: Get My Tokens
app.get('/api/tokens/my', async (c) => {
  const userEmail = c.req.query('email');
  if (!userEmail) {
    return c.json({ success: false, error: 'Missing user email' }, 400);
  }

  if (c.env?.DB) {
    try {
      const rows = await c.env.DB.prepare(`
        SELECT * FROM tokens WHERE user_email = ? ORDER BY booked_at DESC
      `).bind(userEmail).all();
      if (rows?.results) {
        const tokens = rows.results.map(mapDbToken);
        return c.json({ success: true, count: tokens.length, tokens });
      }
    } catch (e) {
      console.warn('D1 tokens/my error:', e);
    }
  }

  const tokens = memoryStore.getUserTokens(userEmail);
  return c.json({ success: true, count: tokens.length, tokens });
});

// 6. Customer: Cancel Token Early
app.post('/api/tokens/cancel', async (c) => {
  const body = await getJsonBody(c);
  const { tokenId, userEmail } = body;

  if (!tokenId || !userEmail) {
    return c.json({ success: false, error: 'Missing tokenId or userEmail' }, 400);
  }

  if (c.env?.DB) {
    try {
      const token = await c.env.DB.prepare(`
        SELECT * FROM tokens WHERE id = ? AND user_email = ? AND status = 'ACTIVE'
      `).bind(tokenId, userEmail).first();

      if (token) {
        await c.env.DB.prepare("UPDATE tokens SET status = 'CANCELLED' WHERE id = ?").bind(tokenId).run();
        await c.env.DB.prepare(`
          UPDATE products SET available_quantity = available_quantity + 1, status = 'AVAILABLE' WHERE id = ?
        `).bind(token.product_id).run();

        return c.json({ success: true, message: 'Token cancelled and item returned to clearance stock.' });
      }
    } catch (e) {
      console.warn('D1 cancel error:', e);
    }
  }

  const success = memoryStore.cancelToken(tokenId, userEmail);
  if (!success) {
    return c.json({ success: false, error: 'Active token not found or already processed' }, 400);
  }

  return c.json({ success: true, message: 'Token cancelled and item returned to clearance stock.' });
});

// ============================================================================
// ZERO-TRUST SECURITY ENFORCEMENT MIDDLEWARE
// Intercepts ALL /api/merchant/* requests and validates server-signed session token
// ============================================================================
app.use('/api/merchant/*', async (c, next) => {
  // Allow preflight OPTIONS without authorization
  if (c.req.method === 'OPTIONS') {
    return await next();
  }

  const authHeader = c.req.header('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({
      success: false,
      error: 'Zero-Trust Security Error: Unauthorized access. Please authenticate via Google Authenticator on the Merchant Portal.',
      code: 'UNAUTHORIZED'
    }, 401);
  }

  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  const sessionSecret = c.env?.ADMIN_SESSION_SECRET || 'SHREE_DURGA_ZERO_TRUST_SECRET_KEY_2026_CLOUDFLARE';
  const isValid = await verifyZeroTrustSessionToken(token, sessionSecret);

  if (!isValid) {
    return c.json({
      success: false,
      error: 'Zero-Trust Security Error: Admin session expired or signature invalid. Please re-authenticate.',
      code: 'SESSION_EXPIRED'
    }, 401);
  }

  await next();
});

// 7. Merchant: Scan / Verify Token (via QR Payload or Token ID)
app.post('/api/merchant/scan', async (c) => {
  const body = await getJsonBody(c);
  const { query } = body;

  if (!query) {
    return c.json({ success: false, error: 'Missing token code or QR string.' }, 400);
  }

  if (c.env?.DB) {
    try {
      let cleanQuery = query.trim();
      let isTampered = false;

      // Verify cryptographic anti-tamper QR signature if scanned from QR payload
      if (cleanQuery.startsWith('SD-TOKEN:')) {
        const parts = cleanQuery.split(':');
        if (parts.length >= 4) {
          const [_, extractedTokenId, scannedPrice, sigHex] = parts;
          cleanQuery = extractedTokenId;
          const sessionSecret = c.env?.ADMIN_SESSION_SECRET || 'SHREE_DURGA_ZERO_TRUST_SECRET_KEY_2026_CLOUDFLARE';
          
          const probe = await c.env.DB.prepare('SELECT product_id, final_payable_amount FROM tokens WHERE id = ?').bind(extractedTokenId).first();
          if (probe) {
            const isValidSig = await verifyTokenQrSignature(extractedTokenId, probe.product_id, probe.final_payable_amount, sigHex, sessionSecret);
            if (!isValidSig || Number(scannedPrice) !== Number(probe.final_payable_amount)) {
              isTampered = true;
            }
          }
        }
      }

      if (isTampered) {
        return c.json({
          success: true,
          valid: false,
          error: '🚨 SECURITY TAMPER ALERT: Cryptographic QR signature mismatch! Forged or altered price detected.'
        });
      }

      const tokenRow = await c.env.DB.prepare(`
        SELECT * FROM tokens WHERE id = ? OR qr_payload = ?
      `).bind(cleanQuery, query.trim()).first();

      if (!tokenRow) {
        return c.json({ success: true, valid: false, error: 'Invalid Token! No reservation found in system.' });
      }

      const token = mapDbToken(tokenRow);

      if (token.status === 'CLAIMED') {
        return c.json({
          success: true,
          valid: false,
          status: 'CLAIMED',
          claimedAt: token.claimedAt,
          error: 'This token has ALREADY BEEN CLAIMED!'
        });
      }

      if (token.status === 'EXPIRED' || new Date(token.expiresAt) < new Date()) {
        return c.json({
          success: true,
          valid: false,
          status: 'EXPIRED',
          error: 'Token has EXPIRED! (24 hours window elapsed)'
        });
      }

      if (token.status === 'CANCELLED') {
        return c.json({
          success: true,
          valid: false,
          status: 'CANCELLED',
          error: 'Customer had cancelled this token.'
        });
      }

      return c.json({
        success: true,
        valid: true,
        status: 'ACTIVE',
        token,
        pricingBreakdown: {
          originalPrice: token.originalPrice,
          discountedPrice: token.discountedPrice,
          cashbackDiscount: token.cashbackAmount,
          finalPayableAmount: token.finalPayableAmount
        }
      });
    } catch (e) {
      console.warn('D1 scan error:', e);
    }
  }

  const token = memoryStore.findTokenForScan(query.trim());
  if (!token) {
    return c.json({ success: true, valid: false, error: 'Invalid Token! No reservation found in system.' });
  }

  return c.json({
    success: true,
    valid: token.status === 'ACTIVE',
    status: token.status,
    token,
    pricingBreakdown: {
      originalPrice: token.originalPrice,
      discountedPrice: token.discountedPrice,
      cashbackDiscount: token.cashbackAmount,
      finalPayableAmount: token.finalPayableAmount
    }
  });
});

// 8. Merchant: Confirm Redemption & Mark as CLAIMED
app.post('/api/merchant/claim', async (c) => {
  const body = await getJsonBody(c);
  const { tokenId } = body;

  if (!tokenId) {
    return c.json({ success: false, error: 'Missing tokenId' }, 400);
  }

  if (c.env?.DB) {
    try {
      const tokenRow = await c.env.DB.prepare('SELECT * FROM tokens WHERE id = ?').bind(tokenId).first();
      if (!tokenRow) return c.json({ success: false, error: 'Token not found.' }, 400);
      if (tokenRow.status === 'CLAIMED') return c.json({ success: false, error: 'Token has already been claimed and redeemed!' }, 400);

      const nowIso = new Date().toISOString();
      await c.env.DB.prepare("UPDATE tokens SET status = 'CLAIMED', claimed_at = ? WHERE id = ?").bind(nowIso, tokenId).run();

      // Decrement physical total quantity on sale
      await c.env.DB.prepare(`
        UPDATE products SET 
          total_quantity = MAX(0, total_quantity - 1),
          status = CASE WHEN available_quantity <= 0 OR total_quantity <= 1 THEN 'SOLD_OUT' ELSE status END
        WHERE id = ?
      `).bind(tokenRow.product_id).run();

      const claimedToken = mapDbToken({ ...tokenRow, status: 'CLAIMED', claimed_at: nowIso });
      return c.json({
        success: true,
        message: 'Token claimed successfully! Sale confirmed.',
        token: claimedToken
      });
    } catch (e) {
      console.warn('D1 claim error:', e);
    }
  }

  const result = memoryStore.claimToken(tokenId);
  if (!result.success) {
    return c.json({ success: false, error: result.error }, 400);
  }

  return c.json({
    success: true,
    message: 'Token claimed successfully! Sale confirmed.',
    token: result.token
  });
});

// 9. Merchant: Add New Clearance Cloth Stock (PERSISTENT IN CLOUDFLARE D1)
app.post('/api/merchant/products', async (c) => {
  try {
    const body = await getJsonBody(c);
    const {
      title,
      description,
      category,
      gender,
      size,
      originalPrice,
      discountedPrice,
      cashbackAmount,
      quantity,
      imageUrl
    } = body;

    if (!title || !category || !size || !originalPrice || !discountedPrice || !imageUrl) {
      return c.json({ success: false, error: 'All primary fields (title, category, size, price, image) are required.' }, 400);
    }

    const qty = Number(quantity) || 1;
    const prodId = `prod-${Date.now()}`;
    const now = new Date().toISOString();

    if (c.env?.DB) {
      try {
        await c.env.DB.prepare(`
          INSERT INTO products (
            id, title, description, category, gender, size, 
            original_price, discounted_price, cashback_amount, 
            total_quantity, available_quantity, image_url, status, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'AVAILABLE', ?)
        `).bind(
          prodId, title.trim(), description || '', category, gender || 'Unisex', size,
          Number(originalPrice), Number(discountedPrice), Number(cashbackAmount) || 0,
          qty, qty, imageUrl, now
        ).run();

        const createdProduct: Product = {
          id: prodId,
          title: title.trim(),
          description: description || '',
          category: category as any,
          gender: (gender || 'Unisex') as any,
          size,
          originalPrice: Number(originalPrice),
          discountedPrice: Number(discountedPrice),
          cashbackAmount: Number(cashbackAmount) || 0,
          totalQuantity: qty,
          availableQuantity: qty,
          imageUrl,
          status: 'AVAILABLE',
          createdAt: now
        };

        return c.json({
          success: true,
          message: 'New clearance product uploaded and published to catalog!',
          product: createdProduct
        });
      } catch (dbErr: any) {
        console.error('D1 insert product error:', dbErr);
        return c.json({ success: false, error: 'Database error: ' + (dbErr.message || 'Could not save product') }, 500);
      }
    }

    const newProduct = memoryStore.addProduct({
      title,
      description: description || '',
      category,
      gender: gender || 'Unisex',
      size,
      originalPrice: Number(originalPrice),
      discountedPrice: Number(discountedPrice),
      cashbackAmount: Number(cashbackAmount) || 0,
      totalQuantity: qty,
      availableQuantity: qty,
      imageUrl
    });

    return c.json({
      success: true,
      message: 'New clearance product uploaded and published to catalog!',
      product: newProduct
    });
  } catch (err: any) {
    return c.json({ success: false, error: err.message || 'Failed to add product' }, 500);
  }
});

// 10. Merchant: Analytics & Stats
app.get('/api/merchant/stats', async (c) => {
  if (c.env?.DB) {
    try {
      const activeRes = await c.env.DB.prepare(`
        SELECT count(*) as count FROM tokens 
        WHERE status = 'ACTIVE' AND datetime(expires_at) > datetime('now')
      `).first();

      const claimedRes = await c.env.DB.prepare(`
        SELECT 
          count(*) as count, 
          COALESCE(SUM(cashback_amount), 0) as totalCashback, 
          COALESCE(SUM(final_payable_amount), 0) as totalRevenue 
        FROM tokens WHERE status = 'CLAIMED'
      `).first();

      const prodRes = await c.env.DB.prepare(`
        SELECT 
          count(*) as total, 
          COALESCE(SUM(CASE WHEN available_quantity > 0 THEN 1 ELSE 0 END), 0) as inStock 
        FROM products
      `).first();

      return c.json({
        success: true,
        stats: {
          activeTokens: activeRes?.count || 0,
          totalClaimedCount: claimedRes?.count || 0,
          totalCashbackDistributed: claimedRes?.totalCashback || 0,
          totalRevenueRecovered: claimedRes?.totalRevenue || 0,
          totalProducts: prodRes?.total || 0,
          inStockCount: prodRes?.inStock || 0
        }
      });
    } catch (e) {
      console.warn('D1 stats error:', e);
    }
  }

  const stats = memoryStore.getMerchantStats();
  return c.json({ success: true, stats });
});

// 11. Banners: Get Active Promotional Banners
app.get('/api/banners', (c) => {
  const category = c.req.query('category');
  const banners = memoryStore.getBanners(category);
  return c.json({ success: true, count: banners.length, banners });
});

// 12. Merchant: Add Promotional Banner
app.post('/api/merchant/banners', async (c) => {
  try {
    const body = await getJsonBody(c);
    const { title, subtitle, tag, discountText, cashbackBadge, targetCategory, imageUrl, gradient } = body;
    if (!title || !tag) {
      return c.json({ success: false, error: 'Title and Tag are required.' }, 400);
    }

    const newBanner = memoryStore.addBanner({
      title,
      subtitle: subtitle || '',
      tag,
      discountText: discountText || 'Special Offer',
      cashbackBadge: cashbackBadge || '+ Cashback Available',
      targetCategory: targetCategory || 'All',
      imageUrl: imageUrl || 'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1200&q=80',
      gradient: gradient || 'from-rose-900 via-brand-700 to-amber-900'
    });

    return c.json({ success: true, message: 'Banner published to storefront!', banner: newBanner });
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500);
  }
});

// 13. Merchant: Delete Banner
app.delete('/api/merchant/banners/:id', (c) => {
  const id = c.req.param('id');
  const deleted = memoryStore.deleteBanner(id);
  if (!deleted) {
    return c.json({ success: false, error: 'Banner not found' }, 404);
  }
  return c.json({ success: true, message: 'Banner deleted successfully' });
});

// 14. Merchant: Delete Product (PERSISTENT IN CLOUDFLARE D1)
app.delete('/api/merchant/products/:id', async (c) => {
  const id = c.req.param('id');

  if (c.env?.DB) {
    try {
      await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
      return c.json({ success: true, message: 'Garment deleted from inventory and catalog.' });
    } catch (e: any) {
      console.warn('D1 delete error:', e);
      return c.json({ success: false, error: e.message }, 500);
    }
  }

  const deleted = memoryStore.deleteProduct(id);
  if (!deleted) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, message: 'Garment deleted from inventory and catalog.' });
});

// 15. Merchant: Update Stock Quantity or Mark Sold Out (PERSISTENT IN CLOUDFLARE D1)
app.patch('/api/merchant/products/:id/stock', async (c) => {
  const id = c.req.param('id');
  const body = await getJsonBody(c);
  const qty = Number(body.quantity);
  const safeQty = isNaN(qty) ? 0 : qty;
  const status = safeQty > 0 ? 'AVAILABLE' : 'SOLD_OUT';

  if (c.env?.DB) {
    try {
      await c.env.DB.prepare(`
        UPDATE products SET available_quantity = ?, status = ? WHERE id = ?
      `).bind(safeQty, status, id).run();

      const updated = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
      return c.json({ 
        success: true, 
        message: 'Product stock updated', 
        product: updated ? mapDbProduct(updated) : undefined 
      });
    } catch (e: any) {
      console.warn('D1 stock update error:', e);
      return c.json({ success: false, error: e.message }, 500);
    }
  }

  const updated = memoryStore.updateProductStock(id, safeQty);
  if (!updated) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, message: 'Product stock updated', product: updated });
});

// 16. Scheduled Cron Sweeper Endpoint
app.post('/api/cron/sweep', async (c) => {
  if (c.env?.DB) {
    try {
      const res = await c.env.DB.prepare(`
        UPDATE tokens SET status = 'EXPIRED' 
        WHERE status = 'ACTIVE' AND datetime(expires_at) <= datetime('now')
      `).run();
      return c.json({
        success: true,
        message: `Sweep completed on D1.`,
        meta: res.meta
      });
    } catch (e) {}
  }

  const sweptCount = memoryStore.sweepExpired();
  return c.json({
    success: true,
    message: `Sweep completed. ${sweptCount} expired tokens released back to stock.`,
    sweptCount
  });
});

export default app;
