import { marked } from 'marked';
import type { Submission, Agreement } from './types';

// Configure marked for clean output
marked.setOptions({
  breaks: true,
  gfm: true,
});

export function generatePdfHtml(
  submission: Submission,
  agreement: Agreement,
  customFields: { label: string; value: string }[],
  companyName: string = ''
): string {
  // Convert markdown agreement content to HTML
  const agreementHtml = marked.parse(agreement.content) as string;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, Helvetica, sans-serif; color: #1e293b; padding: 40px; font-size: 13px; line-height: 1.6; }
    .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e2e8f0; padding-bottom: 20px; }
    .header h1 { font-size: 20px; color: #1e293b; margin-bottom: 4px; }
    .header p { color: #64748b; font-size: 11px; }
    .section { margin-bottom: 24px; }
    .section > h2 { font-size: 14px; color: #1e293b; margin-bottom: 12px; padding-bottom: 6px; border-bottom: 1px solid #e2e8f0; }
    .field { display: flex; margin-bottom: 8px; }
    .field-label { width: 160px; color: #64748b; font-size: 12px; flex-shrink: 0; }
    .field-value { color: #1e293b; font-size: 13px; }
    .agreement-text { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; font-size: 11px; line-height: 1.6; color: #475569; }
    .agreement-text h1 { font-size: 16px; color: #1e293b; margin: 16px 0 8px 0; }
    .agreement-text h2 { font-size: 14px; color: #1e293b; margin: 14px 0 6px 0; }
    .agreement-text h3 { font-size: 12px; color: #1e293b; margin: 12px 0 4px 0; }
    .agreement-text h1:first-child, .agreement-text h2:first-child, .agreement-text h3:first-child { margin-top: 0; }
    .agreement-text p { margin: 0 0 8px 0; }
    .agreement-text ul, .agreement-text ol { margin: 0 0 8px 0; padding-left: 20px; }
    .agreement-text li { margin-bottom: 2px; }
    .agreement-text strong { font-weight: 700; color: #334155; }
    .agreement-text em { font-style: italic; }
    .agreement-text blockquote { border-left: 3px solid #cbd5e1; padding-left: 12px; margin: 8px 0; color: #64748b; }
    .agreement-text code { background: #e2e8f0; padding: 1px 4px; border-radius: 3px; font-size: 10px; }
    .agreement-text table { border-collapse: collapse; width: 100%; margin: 8px 0; }
    .agreement-text th, .agreement-text td { border: 1px solid #e2e8f0; padding: 4px 8px; text-align: left; font-size: 10px; }
    .agreement-text th { background: #f1f5f9; font-weight: 600; }
    .acceptance { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px; padding: 12px 16px; margin-top: 20px; }
    .acceptance p { color: #065f46; font-size: 12px; font-weight: 600; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center; color: #94a3b8; font-size: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>${escapeHtml(companyName ? companyName + ' - ' : '')}Ethical Use Agreement</h1>
    <p>Training Consent Record</p>
  </div>

  <div class="section">
    <h2>Participant Information</h2>
    <div class="field">
      <div class="field-label">Reference ID:</div>
      <div class="field-value" style="font-family: monospace; font-size: 11px;">${escapeHtml(submission.id)}</div>
    </div>
    <div class="field">
      <div class="field-label">Full Name:</div>
      <div class="field-value">${escapeHtml(submission.full_name)}</div>
    </div>
    <div class="field">
      <div class="field-label">Email:</div>
      <div class="field-value">${escapeHtml(submission.email)}</div>
    </div>
    <div class="field">
      <div class="field-label">Phone:</div>
      <div class="field-value">${escapeHtml(submission.phone)}</div>
    </div>
    ${customFields.map(f => `
    <div class="field">
      <div class="field-label">${escapeHtml(f.label)}:</div>
      <div class="field-value">${escapeHtml(f.value)}</div>
    </div>`).join('')}
  </div>

  <div class="section">
    <h2>${escapeHtml(agreement.title)}</h2>
    <div class="agreement-text">${agreementHtml}</div>
  </div>

  <div class="acceptance">
    <p>&#10003; The participant has read and agreed to the above agreement.</p>
    <p style="font-weight: normal; margin-top: 4px; font-size: 11px; color: #047857;">
      Date of acceptance: ${escapeHtml(submission.created_at)}
    </p>
  </div>

  <div class="footer">
    <p>This document is an official record of consent for training participation.</p>
  </div>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
