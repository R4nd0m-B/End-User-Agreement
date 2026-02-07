'use server';

import crypto from 'crypto';
import { getDb } from '@/lib/db';
import { isAdminAuthenticated, hashPassword, verifyPassword } from '@/lib/auth';
import { accessKeyUpdateSchema, changePasswordSchema } from '@/lib/validators';
import type { ActionResult, Setting, Branding } from '@/lib/types';

export async function getAccessKey(): Promise<string> {
  const db = getDb();
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('access_key') as Setting | undefined;
  return setting?.value || '';
}

export async function setAccessKey(formData: FormData): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  const raw = { key: formData.get('key') as string };
  const parsed = accessKeyUpdateSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const db = getDb();
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(parsed.data.key, 'access_key');
  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('access_key_updated', JSON.stringify({ method: 'manual' }));
  return { success: true };
}

export async function rotateAccessKey(): Promise<ActionResult<{ newKey: string }>> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  const newKey = `TRAIN-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
  const db = getDb();
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(newKey, 'access_key');
  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('access_key_rotated', JSON.stringify({ method: 'auto' }));
  return { success: true, data: { newKey } };
}

export async function changeAdminPassword(formData: FormData): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  const raw = {
    currentPassword: formData.get('currentPassword') as string,
    newPassword: formData.get('newPassword') as string,
  };
  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message };

  const db = getDb();
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash') as Setting | undefined;
  if (!setting || !verifyPassword(parsed.data.currentPassword, setting.value)) {
    return { success: false, error: 'Current password is incorrect' };
  }

  const newHash = hashPassword(parsed.data.newPassword);
  db.prepare('UPDATE settings SET value = ? WHERE key = ?').run(newHash, 'admin_password_hash');
  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('admin_password_changed', null);
  return { success: true };
}

export async function getDashboardStats(): Promise<{
  totalSubmissions: number;
  customFieldCount: number;
}> {
  const db = getDb();
  const submissions = db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number };
  const fields = db.prepare('SELECT COUNT(*) as count FROM custom_fields WHERE is_active = 1').get() as { count: number };
  return {
    totalSubmissions: submissions.count,
    customFieldCount: fields.count,
  };
}

// --- Branding ---

export async function getBranding(): Promise<Branding> {
  const db = getDb();
  const rows = db.prepare("SELECT key, value FROM settings WHERE key LIKE 'branding_%'").all() as Setting[];
  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key.replace('branding_', '')] = row.value;
  }
  return {
    company_name: map.company_name || 'Your Company',
    logo_url: map.logo_url || '',
    tagline: map.tagline || '',
    page_heading: map.page_heading || 'Ethical Use Agreement',
    page_description: map.page_description || '',
    form_heading: map.form_heading || 'Participant Registration',
    form_description: map.form_description || '',
    primary_color: map.primary_color || '#2563eb',
  };
}

export async function updateBranding(formData: FormData): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  const fields = [
    'company_name', 'logo_url', 'tagline', 'page_heading',
    'page_description', 'form_heading', 'form_description', 'primary_color',
  ];

  const db = getDb();
  const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
  const transaction = db.transaction(() => {
    for (const field of fields) {
      const value = (formData.get(field) as string) || '';
      stmt.run(`branding_${field}`, value);
    }
  });
  transaction();

  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run('branding_updated', null);
  return { success: true };
}
