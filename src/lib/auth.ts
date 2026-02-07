import { compareSync, hashSync } from 'bcryptjs';
import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDb } from './db';
import type { Session } from './types';

const SESSION_COOKIE = 'hula_admin_session';
const ACCESS_COOKIE = 'hula_access';
const SESSION_DURATION_HOURS = 8;
const ACCESS_DURATION_HOURS = 2;

export function hashAccessKey(plain: string): string {
  return plain; // Store plaintext for visibility
}

export function verifyAccessKey(plain: string, stored: string): boolean {
  return plain === stored; // Simple string comparison
}

export function generateAccessKey(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key = '';
  for (let i = 0; i < 8; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${key.substring(0, 4)}-${key.substring(4, 8)}`;
}

export function hashPassword(plain: string): string {
  return hashSync(plain, 10);
}

export function verifyPassword(plain: string, hash: string): boolean {
  return compareSync(plain, hash);
}

// --- Admin Session Management ---

const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_ATTEMPT_WINDOW_MINUTES = 15;

export function checkLoginAttempts(ipAddress: string): boolean {
  const db = getDb();
  const windowStart = new Date(Date.now() - LOGIN_ATTEMPT_WINDOW_MINUTES * 60 * 1000).toISOString();

  const attempts = db.prepare(
    "SELECT COUNT(*) as count FROM login_attempts WHERE ip_address = ? AND attempted_at > ?"
  ).get(ipAddress, windowStart) as { count: number };

  return attempts.count < MAX_LOGIN_ATTEMPTS;
}

export function recordLoginAttempt(ipAddress: string): void {
  const db = getDb();
  db.prepare('INSERT INTO login_attempts (ip_address) VALUES (?)').run(ipAddress);

  // Clean up old attempts
  const cutoffTime = new Date(Date.now() - 60 * 60 * 1000).toISOString(); // Keep 1 hour
  db.prepare("DELETE FROM login_attempts WHERE attempted_at < ?").run(cutoffTime);
}

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

export function verifySession(token: string, ipAddress?: string): boolean {
  const db = getDb();
  const session = db.prepare(
    "SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')"
  ).get(token) as (Session & { ip_address: string }) | undefined;

  if (!session) return false;

  // Validate IP address if provided (prevents session hijacking from different IP)
  if (ipAddress && session.ip_address !== ipAddress) {
    return false;
  }

  return true;
}

export function deleteSession(token: string): void {
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(token);
}

export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.SECURE_COOKIES === 'true',
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

export async function isAdminAuthenticated(ipAddress?: string): Promise<boolean> {
  const token = await getSessionCookie();
  if (!token) return false;
  return verifySession(token, ipAddress);
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
    secure: process.env.SECURE_COOKIES === 'true',
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
