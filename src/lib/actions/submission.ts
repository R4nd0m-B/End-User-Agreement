'use server';

import { v4 as uuidv4 } from 'uuid';
import { getDb } from '@/lib/db';
import { verifyAccessCookie } from '@/lib/auth';
import { submissionSchema } from '@/lib/validators';
import { getActiveAgreement } from './agreement';
import { getCustomFields } from './fields';
import type { ActionResult, Submission } from '@/lib/types';
import { headers } from 'next/headers';

export async function submitForm(formData: FormData): Promise<ActionResult<{ userId: string }>> {
  // Verify access cookie
  const hasAccess = await verifyAccessCookie();
  if (!hasAccess) {
    return { success: false, error: 'Invalid or expired access. Please return to the home page and enter your access key.' };
  }

  // Validate fixed fields
  const raw = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    phone: formData.get('phone') as string,
    agreementAccepted: formData.get('agreementAccepted') as string,
  };

  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  // Get active agreement
  const agreement = await getActiveAgreement();
  if (!agreement) {
    return { success: false, error: 'No active agreement found. Please contact your training administrator.' };
  }

  // Validate and collect custom fields
  const customFields = await getCustomFields();
  const customData: Record<string, string> = {};

  for (const field of customFields) {
    const value = formData.get(`custom_${field.field_name}`) as string || '';
    if (field.is_required && !value.trim()) {
      return { success: false, error: `${field.label} is required` };
    }
    if (value.trim()) {
      customData[field.field_name] = value.trim();
    }
  }

  // Get request metadata
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown';
  const userAgent = headersList.get('user-agent') || 'unknown';

  // Generate submission ID and save
  const userId = uuidv4();
  const db = getDb();

  db.prepare(
    `INSERT INTO submissions (id, full_name, email, phone, agreement_version, accepted, custom_data, ip_address, user_agent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    userId,
    parsed.data.fullName,
    parsed.data.email,
    parsed.data.phone,
    agreement.version,
    1,
    Object.keys(customData).length > 0 ? JSON.stringify(customData) : null,
    ip,
    userAgent
  );

  return { success: true, data: { userId } };
}

export async function getSubmission(id: string): Promise<Submission | null> {
  const db = getDb();
  const submission = db.prepare('SELECT * FROM submissions WHERE id = ?').get(id) as Submission | undefined;
  return submission || null;
}

export async function getSubmissions(
  page: number = 1,
  pageSize: number = 20,
  search?: string
): Promise<{ submissions: Submission[]; total: number }> {
  const db = getDb();
  const offset = (page - 1) * pageSize;

  if (search && search.trim()) {
    const like = `%${search.trim()}%`;
    const total = db.prepare(
      'SELECT COUNT(*) as count FROM submissions WHERE full_name LIKE ? OR email LIKE ? OR id LIKE ?'
    ).get(like, like, like) as { count: number };

    const submissions = db.prepare(
      'SELECT * FROM submissions WHERE full_name LIKE ? OR email LIKE ? OR id LIKE ? ORDER BY created_at DESC LIMIT ? OFFSET ?'
    ).all(like, like, like, pageSize, offset) as Submission[];

    return { submissions, total: total.count };
  }

  const total = db.prepare('SELECT COUNT(*) as count FROM submissions').get() as { count: number };
  const submissions = db.prepare(
    'SELECT * FROM submissions ORDER BY created_at DESC LIMIT ? OFFSET ?'
  ).all(pageSize, offset) as Submission[];

  return { submissions, total: total.count };
}

export async function getAllSubmissions(): Promise<Submission[]> {
  const db = getDb();
  return db.prepare('SELECT * FROM submissions ORDER BY created_at DESC').all() as Submission[];
}
