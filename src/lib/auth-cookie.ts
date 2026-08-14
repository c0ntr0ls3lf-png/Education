/**
 * Auth cookie utilities for signing and verifying authentication tokens.
 *
 * Uses the Web Crypto API (crypto.subtle) which is available in both
 * Node.js runtime (API routes) and Edge Runtime (middleware).
 */

if (process.env.NODE_ENV === 'production' && !process.env.AUTH_SECRET) {
  console.error('CRITICAL SECURITY ERROR: AUTH_SECRET is not set in production environment!');
}

const SECRET = process.env.AUTH_SECRET || 'edulms_default_secret_change_in_production';

interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

/**
 * Get a signing key from the secret using Web Crypto API.
 */
async function getSigningKey(): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Sign an auth token payload into a string token.
 * Format: base64url(payload).timestamp.signature
 */
export async function signAuthToken(payload: AuthTokenPayload): Promise<string> {
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  const timestamp = Math.floor(Date.now() / 1000);

  const key = await getSigningKey();
  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${payloadB64}.${timestamp}`)
  );
  const signature = Buffer.from(signatureBuffer).toString('hex');

  return `${payloadB64}.${timestamp}.${signature}`;
}

/**
 * Verify and decode an auth token.
 * Returns the payload if valid, null otherwise.
 */
export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [payloadB64, timestampStr, signature] = parts;

    // Check token age (7 days max)
    const timestamp = parseInt(timestampStr, 10);
    const maxAge = 60 * 60 * 24 * 7; // 7 days in seconds
    if (Math.floor(Date.now() / 1000) - timestamp > maxAge) return null;

    // Verify signature using Web Crypto API
    const key = await getSigningKey();
    const encoder = new TextEncoder();
    const signatureBuffer = Buffer.from(signature, 'hex');
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signatureBuffer,
      encoder.encode(`${payloadB64}.${timestampStr}`)
    );

    if (!isValid) return null;

    const payloadStr = Buffer.from(payloadB64, 'base64url').toString();
    const payload = JSON.parse(payloadStr) as AuthTokenPayload;

    if (!payload.id || !payload.email || !payload.role) return null;

    return payload;
  } catch {
    return null;
  }
}
