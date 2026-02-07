import { redirect } from 'next/navigation';
import { getSubmission } from '@/lib/actions/submission';
import Card from '@/components/ui/Card';
import Alert from '@/components/ui/Alert';

interface ConfirmationPageProps {
  searchParams: Promise<{ id?: string }>;
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const params = await searchParams;
  const id = params.id;

  if (!id) redirect('/');

  const submission = await getSubmission(id);
  if (!submission) redirect('/');

  const customData = submission.custom_data ? JSON.parse(submission.custom_data) : {};

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 mb-4">
            <svg className="w-7 h-7 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 mb-1">Agreement Recorded</h1>
          <p className="text-gray-500 text-sm">Your consent has been saved successfully.</p>
        </div>

        <Card>
          <div className="space-y-4">
            <Alert variant="info">
              Your reference ID: <strong className="font-mono text-xs">{submission.id}</strong>
            </Alert>

            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Name</dt>
                <dd className="text-gray-900 font-medium">{submission.full_name}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Email</dt>
                <dd className="text-gray-900 font-medium">{submission.email}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phone</dt>
                <dd className="text-gray-900 font-medium">{submission.phone}</dd>
              </div>
              {Object.entries(customData).map(([key, value]) => (
                <div key={key} className="flex justify-between">
                  <dt className="text-gray-500 capitalize">{key.replace(/_/g, ' ')}</dt>
                  <dd className="text-gray-900 font-medium">{value as string}</dd>
                </div>
              ))}
              <div className="border-t border-gray-100 pt-3 space-y-2">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Date</dt>
                  <dd className="text-gray-900 font-medium">{submission.created_at}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Accepted</dt>
                  <dd className="text-emerald-600 font-medium">Yes</dd>
                </div>
              </div>
            </dl>
          </div>
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          This record has been saved for compliance and audit purposes.
        </p>
      </div>
    </main>
  );
}
