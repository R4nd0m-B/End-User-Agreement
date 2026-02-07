import { NextRequest, NextResponse } from 'next/server';
import PDFDocument from 'pdfkit';
import { isAdminAuthenticated } from '@/lib/auth';
import { getSubmission } from '@/lib/actions/submission';
import { getAgreementByVersion } from '@/lib/actions/agreement';
import { getAllCustomFields } from '@/lib/actions/fields';
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

  const allFields = await getAllCustomFields();
  const customData: Record<string, string> = submission.custom_data ? JSON.parse(submission.custom_data) : {};
  const customFieldsForPdf = allFields
    .filter((f) => customData[f.field_name])
    .map((f) => ({ label: f.label, value: customData[f.field_name] }));

  const branding = await getBranding();

  try {
    const pdfBuffer = await generatePdf(submission, agreement, customFieldsForPdf, branding.company_name);
    const filename = `Agreement-${submission.full_name.replace(/\s+/g, '_')}-${submission.id.slice(0, 8)}.pdf`;

    return new NextResponse(new Uint8Array(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json({ error: 'Failed to generate PDF' }, { status: 500 });
  }
}

interface PdfSubmission {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  created_at: string;
}

interface PdfAgreement {
  title: string;
  content: string;
}

function generatePdf(
  submission: PdfSubmission,
  agreement: PdfAgreement,
  customFields: { label: string; value: string }[],
  companyName: string
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      const gray = '#64748b';
      const dark = '#1e293b';

      // Header
      const title = companyName ? `${companyName} - Ethical Use Agreement` : 'Ethical Use Agreement';
      doc.fontSize(18).fillColor(dark).text(title, { align: 'center' });
      doc.fontSize(10).fillColor(gray).text('Training Consent Record', { align: 'center' });
      doc.moveDown(0.5);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(1);

      // Participant Information
      doc.fontSize(13).fillColor(dark).text('Participant Information');
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);

      const addField = (label: string, value: string) => {
        const y = doc.y;
        doc.fontSize(10).fillColor(gray).text(label, 50, y, { width: 130 });
        doc.fontSize(11).fillColor(dark).text(value, 185, y, { width: 360 });
        doc.moveDown(0.3);
      };

      addField('Reference ID:', submission.id);
      addField('Full Name:', submission.full_name);
      addField('Email:', submission.email);
      addField('Phone:', submission.phone);
      for (const f of customFields) {
        addField(`${f.label}:`, f.value);
      }

      doc.moveDown(1);

      // Agreement
      doc.fontSize(13).fillColor(dark).text(agreement.title);
      doc.moveDown(0.3);
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);

      // Strip markdown formatting for plain-text rendering
      const plainContent = agreement.content
        .replace(/^#{1,6}\s+/gm, '')       // headings
        .replace(/\*\*(.+?)\*\*/g, '$1')   // bold
        .replace(/\*(.+?)\*/g, '$1')       // italic
        .replace(/`(.+?)`/g, '$1')         // inline code
        .replace(/^\s*[-*+]\s+/gm, '  • ') // list items
        .replace(/^\s*\d+\.\s+/gm, '  ')   // numbered lists
        .replace(/\[(.+?)\]\(.+?\)/g, '$1') // links
        .replace(/>\s*/gm, '  ')           // blockquotes
        .replace(/---+/g, '')              // horizontal rules
        .replace(/\n{3,}/g, '\n\n');       // excess newlines

      doc.fontSize(10).fillColor('#475569').text(plainContent, {
        width: 495,
        lineGap: 3,
      });

      doc.moveDown(1);

      // Acceptance box
      doc.roundedRect(50, doc.y, 495, 50, 4).fillAndStroke('#ecfdf5', '#a7f3d0');
      const boxY = doc.y + 10;
      doc.fontSize(11).fillColor('#065f46').text('\u2713 The participant has read and agreed to the above agreement.', 65, boxY);
      doc.fontSize(9).fillColor('#047857').text(`Date of acceptance: ${submission.created_at}`, 65, boxY + 18);

      doc.y = boxY + 50;
      doc.moveDown(2);

      // Footer
      doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#e2e8f0').stroke();
      doc.moveDown(0.5);
      doc.fontSize(8).fillColor('#94a3b8').text(
        'This document is an official record of consent for training participation.',
        { align: 'center' }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
