import { NextRequest, NextResponse } from 'next/server';
import { isAdminAuthenticated } from '@/lib/auth';
import { getAllSubmissions } from '@/lib/actions/submission';
import { getAllCustomFields } from '@/lib/actions/fields';
import { generateCsv } from '@/lib/csv';

export async function GET(request: NextRequest) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const isAuth = await isAdminAuthenticated(ipAddress);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const submissions = await getAllSubmissions();
  const customFields = await getAllCustomFields();

  const csv = generateCsv(submissions, customFields);
  const date = new Date().toISOString().split('T')[0];

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="submissions-${date}.csv"`,
    },
  });
}
