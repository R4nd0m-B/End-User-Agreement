import { compareSync, hashSync } from 'bcryptjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDb } from './db';
import type { Session } from './types';

const SESSION_COOKIE = 'hula_admin_session';
const ACCESS_COOKIE = 'hula_access';
const SESSION_DURATION_HOURS = 8;
const ACCESS_DURATION_HOURS = 2;

export function hashPassword(plain: string): string {
  return hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return compareSync(plain, hash);
}

// --- Admin Session Management ---

export function createSession(ipAddress: string): string {
  const db = getDb();
  const id = crypto.randomUUID();
  const now = new Date();
  const expires = new Date(now.getTime() + SESSION_DURATION_HOURS * 60 * 60 * 1000);

  db.prepare('INSERT INTO sessions (id, ip_address, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    id,
    ipAddress,
    now.toISOString(),
    expires.toISOString()
  );

  // Clean up expired sessions
  db.prepare("DELETE FROM sessions WHERE expires_at < datetime('now')").run();

  return id;
}

export function verifySession(token: string): boolean {
  const db = getDb();
  const session = db.prepare(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(token) as Session | undefined;
  return !!session;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_HOURS * 60 * 60,
  });
}

export async function getSessionCookie(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE)?.value;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySession(token);
}

// --- Access Key Cookie ---

function signValue(value: string): string {
  const secret = process.env.SESSION_SECRET || 'default-secret';
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(value);
  return hmac.digest('hex');
}

export async function setAccessCookie(): Promise<void> {
  const cookieStore = await cookies();
  const timestamp = Date.now().toString();
  const signature = signValue(timestamp);
  cookieStore.set(ACCESS_COOKIE, `${timestamp}.${signature}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ACCESS_DURATION_HOURS * 60 * 60,
  });
}

export async function verifyAccessCookie(): Promise<boolean> {
  const cookieStore = await cookies();
  const value = cookieStore.get(ACCESS_COOKIE)?.value;
  if (!value) return false;

  const [timestamp, signature] = value.split('.');
  if (!timestamp || !signature) return false;

  const expected = signValue(timestamp);
  if (signature !== expected) return false;

  // Check expiry (2 hours)
  const ts = parseInt(timestamp, 10);
  if (isNaN(ts)) return false;
  const elapsed = Date.now() - ts;
  return elapsed < ACCESS_DURATION_HOURS * 60 * 60 * 1000;
}
