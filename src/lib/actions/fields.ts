'use server';

import { getDb } from '@/lib/db';
import { isAdminAuthenticated } from '@/lib/auth';
import { customFieldSchema } from '@/lib/validators';
import type { ActionResult, CustomField } from '@/lib/types';

export async function getCustomFields(): Promise<CustomField[]> {
  const db = getDb();
  return db.prepare(
    'SELECT * FROM custom_fields WHERE is_active = 1 ORDER BY sort_order ASC'
  ).all() as CustomField[];
}

export async function getAllCustomFields(): Promise<CustomField[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM custom_fields ORDER BY sort_order ASC').all() as CustomField[];
}

export async function addCustomField(formData: FormData): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const raw = {
    field_name: formData.get('field_name') as string,
    label: formData.get('label') as string,
    field_type: formData.get('field_type') as string,
    placeholder: formData.get('placeholder') as string || undefined,
    is_required: parseInt(formData.get('is_required') as string || '0', 10),
    options: formData.get('options') as string || undefined,
  };

  const parsed = customFieldSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const db = getDb();

  // Check for duplicate field_name
  const existing = db.prepare(
    'SELECT id FROM custom_fields WHERE field_name = ? AND is_active = 1'
  ).get(parsed.data.field_name);
  if (existing) {
    return { success: false, error: 'A field with this name already exists' };
  }

  // Get next sort order
  const maxOrder = db.prepare('SELECT MAX(sort_order) as max FROM custom_fields WHERE is_active = 1').get() as { max: number | null };
  const nextOrder = (maxOrder.max || 0) + 1;

  db.prepare(
    'INSERT INTO custom_fields (field_name, label, field_type, placeholder, is_required, options, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).run(
    parsed.data.field_name,
    parsed.data.label,
    parsed.data.field_type,
    parsed.data.placeholder || null,
    parsed.data.is_required,
    parsed.data.options || null,
    nextOrder
  );

  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run(
    'field_added',
    JSON.stringify({ field_name: parsed.data.field_name, label: parsed.data.label })
  );

  return { success: true };
}

export async function updateCustomField(formData: FormData): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) return { success: false, error: 'Unauthorized' };

  const id = parseInt(formData.get('id') as string, 10);
  const label = (formData.get('label') as string || '').trim();
  const field_type = formData.get('field_type') as string || 'text';
  const placeholder = (formData.get('placeholder') as string || '').trim();
  const is_required = formData.get('is_required') === '1' ? 1 : 0;
  const options = (formData.get('options') as string || '').trim();

  if (!label) return { success: false, error: 'Label is required' };

  const db = getDb();
  db.prepare(
    'UPDATE custom_fields SET label = ?, field_type = ?, placeholder = ?, is_required = ?, options = ? WHERE id = ?'
  ).run(label, field_type, placeholder || null, is_required, options || null, id);

  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run(
    'field_updated', JSON.stringify({ id, label })
  );
  return { success: true };
}

export async function removeCustomField(id: number): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const db = getDb();
  db.prepare('UPDATE custom_fields SET is_active = 0 WHERE id = ?').run(id);

  db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run(
    'field_removed',
    JSON.stringify({ id })
  );

  return { success: true };
}

export async function reorderFields(orderedIds: number[]): Promise<ActionResult> {
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    return { success: false, error: 'Unauthorized' };
  }

  const db = getDb();
  const stmt = db.prepare('UPDATE custom_fields SET sort_order = ? WHERE id = ?');
  const transaction = db.transaction(() => {
    orderedIds.forEach((id, index) => {
      stmt.run(index + 1, id);
    });
  });
  transaction();

  return { success: true };
}
