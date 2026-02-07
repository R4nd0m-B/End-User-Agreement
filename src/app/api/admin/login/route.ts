import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { verifyPassword, createSession, setSessionCookie, checkLoginAttempts, recordLoginAttempt } from '@/lib/auth';
import { adminLoginSchema } from '@/lib/validators';
import type { Setting } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    // Check rate limiting
    if (!checkLoginAttempts(ipAddress)) {
      recordLoginAttempt(ipAddress);
      return NextResponse.json(
        { success: false, error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);

    if (!parsed.success) {
      recordLoginAttempt(ipAddress);
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const db = getDb();
    const setting = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password_hash') as Setting | undefined;

    if (!setting || !verifyPassword(parsed.data.password, setting.value)) {
      recordLoginAttempt(ipAddress);
      return NextResponse.json(
        { success: false, error: 'Invalid password' },
        { status: 401 }
      );
    }

    const sessionToken = createSession(ipAddress);
    await setSessionCookie(sessionToken);

    db.prepare('INSERT INTO audit_log (action, details) VALUES (?, ?)').run(
      'admin_login',
      JSON.stringify({ ip: ipAddress })
    );

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
