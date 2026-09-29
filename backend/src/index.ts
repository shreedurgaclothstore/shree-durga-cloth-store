import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { memoryStore, DEFAULT_SHOP } from './db';

const app = new Hono<{ Bindings: { DB?: any; PHOTOS?: any } }>();

// Enable CORS for frontend applications (Customer App & Merchant Portal)
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Helper for safe JSON body parsing
async function getJsonBody<T = any>(c: any): Promise<T> {
  try {
    return await c.req.json();
  } catch (e) {
    return {} as T;
  }
}

// Health & Root
app.get('/', (c) => {
  return c.json({
    name: 'Cloth Shop O2O Clearance API',
    status: 'ONLINE',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 1. Get Shop Details
app.get('/api/shop', (c) => {
  return c.json({ success: true, shop: DEFAULT_SHOP });
});

// 2. Get Public Products Catalog (with filters)
app.get('/api/products', (c) => {
  const category = c.req.query('category');
  const gender = c.req.query('gender');
  const size = c.req.query('size');
  const search = c.req.query('search');

  const products = memoryStore.getProducts({ category, gender, size, search });
  return c.json({ success: true, count: products.length, products });
});

// 3. Get Single Product
app.get('/api/products/:id', (c) => {
  const id = c.req.param('id');
  const product = memoryStore.getProductById(id);
  if (!product) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, product });
});

// 4. Customer: Book 24-Hour Clearance Token
app.post('/api/tokens/book', async (c) => {
  try {
    const body = await getJsonBody(c);
    const { productId, userId, userEmail, userName, userPhone } = body;

    if (!productId || !userEmail) {
      return c.json({ success: false, error: 'Missing required fields: productId and userEmail are required.' }, 400);
    }

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
app.get('/api/tokens/my', (c) => {
  const userEmail = c.req.query('email');
  if (!userEmail) {
    return c.json({ success: false, error: 'Missing user email' }, 400);
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

  const success = memoryStore.cancelToken(tokenId, userEmail);
  if (!success) {
    return c.json({ success: false, error: 'Active token not found or already processed' }, 400);
  }

  return c.json({ success: true, message: 'Token cancelled and item returned to clearance stock.' });
});

// 7. Merchant: Scan / Verify Token (via QR Payload or Token ID)
app.post('/api/merchant/scan', async (c) => {
  const body = await getJsonBody(c);
  const { query } = body;

  if (!query) {
    return c.json({ success: false, error: 'Missing token code or QR string.' }, 400);
  }

  const token = memoryStore.findTokenForScan(query.trim());
  if (!token) {
    return c.json({
      success: true,
      valid: false,
      error: 'Invalid Token! No reservation found in system.'
    });
  }

  if (token.status === 'CLAIMED') {
    return c.json({
      success: true,
      valid: false,
      status: 'CLAIMED',
      claimedAt: token.claimedAt,
      error: 'This token has ALREADY BEEN CLAIMED!'
    });
  }

  if (token.status === 'EXPIRED') {
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
});

// 8. Merchant: Confirm Redemption & Mark as CLAIMED
app.post('/api/merchant/claim', async (c) => {
  const body = await getJsonBody(c);
  const { tokenId } = body;

  if (!tokenId) {
    return c.json({ success: false, error: 'Missing tokenId' }, 400);
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

// 9. Merchant: Add New Clearance Cloth Stock
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
app.get('/api/merchant/stats', (c) => {
  const stats = memoryStore.getMerchantStats();
  return c.json({ success: true, stats });
});

// 11. Banners: Get Active Promotional Banners (Flipkart/Amazon style)
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

// 14. Merchant: Delete Product
app.delete('/api/merchant/products/:id', (c) => {
  const id = c.req.param('id');
  const deleted = memoryStore.deleteProduct(id);
  if (!deleted) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, message: 'Garment deleted from inventory and catalog.' });
});

// 15. Merchant: Update Stock Quantity or Mark Sold Out
app.patch('/api/merchant/products/:id/stock', async (c) => {
  const id = c.req.param('id');
  const body = await getJsonBody(c);
  const qty = Number(body.quantity);

  const updated = memoryStore.updateProductStock(id, isNaN(qty) ? 0 : qty);
  if (!updated) {
    return c.json({ success: false, error: 'Product not found' }, 404);
  }
  return c.json({ success: true, message: 'Product stock updated', product: updated });
});

// 16. Scheduled Cron Sweeper Endpoint
app.post('/api/cron/sweep', (c) => {
  const sweptCount = memoryStore.sweepExpired();
  return c.json({
    success: true,
    message: `Sweep completed. ${sweptCount} expired tokens released back to stock.`,
    sweptCount
  });
});

export default app;
