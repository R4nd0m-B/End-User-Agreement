'use server';

import { getDb } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { agreementUpdateSchema } from '@/lib/validators';
import type { ActionResult, Agreement } from '@/lib/types';

export async function getActiveAgreement(): Promise<Agreement | null> {
  const db = getDb();
  const agreement = db.prepare(
    'SELECT * FROM agreements WHERE is_active = 1 ORDER BY version DESC LIMIT 1'
  ).get() as Agreement | undefined;
  return agreement || null;
}

export async function getAgreementHistory(): Promise<Agreement[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM agreements ORDER BY version DESC').all() as Agreement[];
}

export async function getAgreementByVersion(version: number): Promise<Agreement | null> {
  const db = getDb();
  const agreement = db.prepare('SELECT * FROM agreements WHERE version = ?').get(version) as Agreement | undefined;
  return agreement || null;
}

export async function updateAgreement(formData: FormData): Promise<ActionResult<{ version: number }>> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const raw = {
    title: formData.get('title') as string,
    content: formData.get('content') as string,
  };

  const parsed = agreementUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const db = getDb();

  // Get the next version number
  const maxVersion = db.prepare('SELECT MAX(version) as max FROM agreements').get() as { max: number | null };
  const newVersion = (maxVersion.max || 0) + 1;

  // Deactivate all existing versions
  db.prepare('UPDATE agreements SET is_active = 0').run();

  // Insert new version
  db.prepare(
    'INSERT INTO agreements (version, title, content, is_active) VALUES (?, ?, ?, 1)'
  ).run(newVersion, parsed.data.title, parsed.data.content);

  // Audit log
  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run(
    'agreement_updated',
    JSON.stringify({ version: newVersion, title: parsed.data.title })
  );

  return { success: true, data: { version: newVersion } };
}
