// Standard RFC 6238 TOTP Engine for Google Authenticator (Web Crypto API)

export const DEFAULT_MASTER_SECRET = 'KRDG4ZDPNU6T2ZLS'; // Base32 for 'shreedurga2026'
export const EMERGENCY_MASTER_PASSCODE = 'SD-2026-DURGA';

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
    bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
  }
  return bytes;
}

export async function generateTOTP(secret: string, timeStepOffset = 0): Promise<string> {
  const keyBytes = base32ToUint8Array(secret);
  const cryptoKey = await window.crypto.subtle.importKey(
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

  const signature = await window.crypto.subtle.sign('HMAC', cryptoKey, buffer);
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

export async function verifyTOTP(token: string, secret: string): Promise<boolean> {
  const cleanToken = token.trim();
  if (!cleanToken) return false;

  // Emergency passcode bypass check
  if (cleanToken.toUpperCase() === EMERGENCY_MASTER_PASSCODE) {
    return true;
  }

  // Check current time step and ±1 step for clock drift tolerance
  for (const offset of [0, -1, 1]) {
    try {
      const validCode = await generateTOTP(secret, offset);
      if (validCode === cleanToken) {
        return true;
      }
    } catch (e) {
      console.warn('TOTP calc error', e);
    }
  }
  return false;
}

export function getOtpAuthUrl(secret: string, account = 'CounterAdmin', issuer = 'Shree Durga Cloth'): string {
  return `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=6&period=30`;
}
