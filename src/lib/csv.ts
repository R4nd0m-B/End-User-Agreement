import type { Submission, CustomField } from './types';

export function generateCsv(submissions: Submission[], customFields: CustomField[]): string {
  // Build headers
  const fixedHeaders = ['User ID', 'Full Name', 'Email', 'Phone'];
  const customHeaders = customFields.map((f) => f.label);
  const trailingHeaders = ['Accepted', 'Submitted At'];
  const allHeaders = [...fixedHeaders, ...customHeaders, ...trailingHeaders];

  const rows: string[][] = [allHeaders];

  for (const sub of submissions) {
    const customData: Record<string, string> = sub.custom_data ? JSON.parse(sub.custom_data) : {};

    const row = [
      sub.id,
      sub.full_name,
      sub.email,
      sub.phone,
      ...customFields.map((f) => customData[f.field_name] || ''),
      sub.accepted ? 'Yes' : 'No',
      sub.created_at,
    ];

    rows.push(row);
  }

  return rows.map((row) => row.map(escapeCsvField).join(',')).join('\n');
}

function escapeCsvField(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
