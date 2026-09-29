// Zero-Trust Cryptographic Security Engine for Cloudflare Workers
// Implements RFC 6238 TOTP (Google Authenticator) + HMAC-SHA256 Session Signing

export function base32ToUint8Array(base32: string): Uint8Array {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  const clean = base32.toUpperCase().replace(/=+$/, '').replace(/\s+/g, '');
  for (let i = 0; i < clean.length; i++) {
    const val = alphabet.indexOf(clean[i]);
    if (val === -1) continue;
    bits += val.toString(2).padStart(5, '0');
  }
  const bytes = new Uint8Array(Math.floor(bits.length / 8));
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(bits.substring(i * 8, (i + 1) * 8), 2);
  }
  return bytes;
}

// Generate 6-digit TOTP code for a given 30-second time window offset
export async function generateServerTOTP(secret: string, timeStepOffset = 0): Promise<string> {
  const keyBytes = base32ToUint8Array(secret);
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBytes as unknown as BufferSource,
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );

  const counter = Math.floor(Date.now() / 1000 / 30) + timeStepOffset;
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setBigUint64(0, BigInt(counter), false); // Big endian

  const signature = await crypto.subtle.sign('HMAC', cryptoKey, buffer);
  const sigBytes = new Uint8Array(signature);

  const offset = sigBytes[sigBytes.length - 1] & 0x0f;
  const binary =
    ((sigBytes[offset] & 0x7f) << 24) |
    ((sigBytes[offset + 1] & 0xff) << 16) |
    ((sigBytes[offset + 2] & 0xff) << 8) |
    (sigBytes[offset + 3] & 0xff);

  const otp = (binary % 1000000).toString().padStart(6, '0');
  return otp;
}

// Verify TOTP code with clock drift tolerance and emergency bypass
export async function verifyServerTOTP(
  token: string,
  secret: string,
  emergencyPasscode?: string
): Promise<boolean> {
  const cleanToken = token.trim();
  if (!cleanToken) return false;

  // Emergency passcode bypass check
  if (emergencyPasscode && cleanToken.toUpperCase() === emergencyPasscode.toUpperCase()) {
    return true;
  }

  // Check current time step and ±1 step (90-second drift tolerance)
  for (const offset of [0, -1, 1]) {
    try {
      const validCode = await generateServerTOTP(secret, offset);
      if (validCode === cleanToken) {
        return true;
      }
    } catch (e) {
      console.warn('TOTP verification error:', e);
    }
  }
  return false;
}

// Helper: UTF-8 string to Base64URL
function toBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Helper: Base64URL to UTF-8 string
function fromBase64Url(b64u: string): string {
  let b64 = b64u.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4 !== 0) {
    b64 += '=';
  }
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

// Helper: ArrayBuffer to Hex string
function bufToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

// Create an HMAC-SHA256 signed Zero Trust Session Token
export async function createZeroTrustSessionToken(
  sessionSecret: string,
  durationHours = 12
): Promise<{ token: string; expiresAt: number }> {
  const now = Date.now();
  const expiresAt = now + durationHours * 60 * 60 * 1000;

  const payload = {
    sub: 'merchant-admin',
    shop: 'shree-durga-cloth-store',
    iat: now,
    exp: expiresAt,
    nonce: Math.random().toString(36).substring(2, 12)
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = toBase64Url(payloadStr);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(sessionSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
  const signatureHex = bufToHex(signature);

  return {
    token: `${payloadB64}.${signatureHex}`,
    expiresAt
  };
}

// Cryptographically verify Zero Trust Session Token
export async function verifyZeroTrustSessionToken(
  token: string,
  sessionSecret: string
): Promise<boolean> {
  try {
    if (!token || !token.includes('.')) return false;

    const [payloadB64, signatureHex] = token.split('.');
    if (!payloadB64 || !signatureHex) return false;

    // Verify signature
    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(sessionSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const expectedSig = await crypto.subtle.sign('HMAC', key, encoder.encode(payloadB64));
    const expectedHex = bufToHex(expectedSig);

    if (expectedHex !== signatureHex) {
      return false;
    }

    // Verify expiration
    const payloadJson = fromBase64Url(payloadB64);
    const payload = JSON.parse(payloadJson);

    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }

    return true;
  } catch (e) {
    console.warn('Session verification failed:', e);
    return false;
  }
}

// Generate OTPAuth URI for QR code setup
export function getOtpAuthUrl(
  secret: string,
  account = 'CounterAdmin',
  issuer = 'Shree Durga Cloth Store'
): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
