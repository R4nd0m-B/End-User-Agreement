import { redirect } from 'next/navigation';
import { getSubmission } from '@/lib/actions/submission';
import { getAgreementByVersion } from '@/lib/actions/agreement';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import Link from 'next/link';

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({ params }: SubmissionDetailPageProps) {
  const { id } = await params;
  const submission = await getSubmission(id);

  if (!submission) {
    redirect('/admin/submissions');
  }

  const agreement = await getAgreementByVersion(submission.agreement_version);
  const customData = submission.custom_data ? JSON.parse(submission.custom_data) : {};

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/submissions" className="text-sm text-blue-600 hover:text-blue-800 mb-2 inline-block">
            &larr; Back to Submissions
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Submission Detail</h1>
        </div>
        <a href={`/api/export/pdf/${submission.id}`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary">Export PDF</Button>
        </a>
      </div>

      <div className="space-y-6">
        <Card header={<h2 className="text-lg font-semibold text-gray-900">User Information</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">User ID</p>
              <p className="text-sm font-mono text-gray-900">{submission.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Full Name</p>
              <p className="text-sm text-gray-900">{submission.full_name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-sm text-gray-900">{submission.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="text-sm text-gray-900">{submission.phone}</p>
            </div>
            {Object.entries(customData).map(([key, value]) => (
              <div key={key}>
                <p className="text-sm text-gray-500 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-900">{value as string}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h2 className="text-lg font-semibold text-gray-900">Agreement</h2>}>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Badge variant="success">Accepted</Badge>
            </div>
            <div>
              <p className="text-sm text-gray-500">Submitted At</p>
              <p className="text-sm text-gray-900">{new Date(submission.created_at).toLocaleString()}</p>
            </div>
            {agreement && (
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-2">Agreement Text</p>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs text-gray-700 agreement-scroll">
                  <MarkdownRenderer content={agreement.content} />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card header={<h2 className="text-lg font-semibold text-gray-900">Metadata</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">IP Address</p>
              <p className="text-sm font-mono text-gray-900">{submission.ip_address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">User Agent</p>
              <p className="text-sm text-gray-900 truncate">{submission.user_agent || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
