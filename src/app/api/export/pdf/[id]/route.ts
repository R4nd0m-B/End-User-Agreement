import { NextRequest, NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import { isAdminAuthenticated } from '@/lib/auth';
import { getSubmission } from '@/lib/actions/submission';
import { getAgreementByVersion } from '@/lib/actions/agreement';
import { getAllCustomFields } from '@/lib/actions/fields';
import { generatePdfHtml } from '@/lib/pdf-template';
import { getBranding } from '@/lib/actions/admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  const isAuth = await isAdminAuthenticated(ipAddress);
  if (!isAuth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const submission = await getSubmission(id);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
  }

  const agreement = await getAgreementByVersion(submission.agreement_version);
  if (!agreement) {
    return NextResponse.json({ error: 'Agreement not found' }, { status: 404 });
  }

  // Build custom field labels + values
  const allFields = await getAllCustomFields();
  const customData: Record<string, string> = submission.custom_data ? JSON.parse(submission.custom_data) : {};
  const customFieldsForPdf = allFields
    .filter((f) => customData[f.field_name])
    .map((f) => ({ label: f.label, value: customData[f.field_name] }));

  const branding = await getBranding();
  const html = generatePdfHtml(submission, agreement, customFieldsForPdf, branding.company_name);

  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' },
    });

    const filename = `Agreement-${submission.full_name.replace(/\s+/g, '_')}-${submission.id.slice(0, 8)}.pdf`;

    return new NextResponse(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
