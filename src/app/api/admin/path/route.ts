import { NextResponse } from 'next/server';
import { getAdminPath } from '@/lib/actions/admin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const path = await getAdminPath();
    return NextResponse.json({ path });
  } catch {
    return NextResponse.json({ path: 'admin' });
  }
}
