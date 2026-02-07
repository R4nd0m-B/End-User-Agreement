'use server';

import { getDb } from '@/lib/db';
import { setAccessCookie } from '@/lib/auth';
import { accessKeySchema } from '@/lib/validators';
import type { ActionResult, Setting } from '@/lib/types';

export async function validateAccessKey(formData: FormData): Promise<ActionResult> {
  const raw = { key: formData.get('key') as string };
  const parsed = accessKeySchema.safeParse(raw);

  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const db = getDb();
  const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('access_key') as Setting | undefined;

  if (!setting || setting.value !== parsed.data.key) {
    return { success: false, error: 'Invalid access key. Please check with your training instructor.' };
  }

  await setAccessCookie();
  return { success: true };
}
