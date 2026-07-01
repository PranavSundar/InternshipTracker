import { cookies } from 'next/headers';

const encoder = new TextEncoder();

async function getKey(): Promise<CryptoKey> {
  const secret = process.env.APP_SECRET || 'default-secret-change-me';
  return crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

async function sign(payload: string): Promise<string> {
  const key = await getKey();
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload));
  return `${payload}.${toHex(signature)}`;
}

async function verify(token: string): Promise<boolean> {
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.substring(0, lastDot);
  const signedToken = await sign(payload);
  return signedToken === token;
}

export async function createSession(): Promise<string> {
  const payload = JSON.stringify({
    authenticated: true,
    createdAt: Date.now(),
  });
  return sign(payload);
}

export async function validateSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('app-session');
  if (!sessionCookie?.value) return false;

  const valid = await verify(sessionCookie.value);
  if (!valid) return false;

  // Check expiry (7 days)
  const lastDot = sessionCookie.value.lastIndexOf('.');
  const payload = sessionCookie.value.substring(0, lastDot);
  try {
    const data = JSON.parse(payload);
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return Date.now() - data.createdAt < sevenDays;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_NAME = 'app-session';
export const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds
