import { redirect } from 'next/navigation';
import { isAdminAuthenticated } from '@/lib/auth';
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
  // Enforce authentication
  const isAuth = await isAdminAuthenticated();
  if (!isAuth) {
    redirect('/admin/login');
  }

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
        <Link href="/admin/submissions" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Submissions
        </Link>
        <a href={`/api/export/pdf/${submission.id}`} target="_blank" rel="noopener noreferrer">
          <Button variant="secondary" size="sm">
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export PDF
          </Button>
        </a>
      </div>

      <div className="space-y-5">
        <Card header={<h2 className="text-sm font-semibold text-gray-900">User Information</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">User ID</p>
              <p className="text-sm font-mono text-gray-900">{submission.id}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Full Name</p>
              <p className="text-sm text-gray-900 font-medium">{submission.full_name}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Email</p>
              <p className="text-sm text-gray-900">{submission.email}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">Phone</p>
              <p className="text-sm text-gray-900">{submission.phone}</p>
            </div>
            {Object.entries(customData).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1 capitalize">{key.replace(/_/g, ' ')}</p>
                <p className="text-sm text-gray-900">{value as string}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card header={<h2 className="text-sm font-semibold text-gray-900">Agreement</h2>}>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="success">Accepted</Badge>
              <p className="text-xs text-gray-500">{new Date(submission.created_at).toLocaleString()}</p>
            </div>
            {agreement && (
              <div className="mt-3">
                <p className="text-xs text-gray-500 mb-2">Agreement Text (v{submission.agreement_version})</p>
                <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-gray-50 text-xs text-gray-700 agreement-scroll">
                  <MarkdownRenderer content={agreement.content} />
                </div>
              </div>
            )}
          </div>
        </Card>

        <Card header={<h2 className="text-sm font-semibold text-gray-900">Metadata</h2>}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <p className="text-xs text-gray-500 mb-1">IP Address</p>
              <p className="text-sm font-mono text-gray-900">{submission.ip_address || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 mb-1">User Agent</p>
              <p className="text-sm text-gray-900 break-all">{submission.user_agent || 'N/A'}</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
