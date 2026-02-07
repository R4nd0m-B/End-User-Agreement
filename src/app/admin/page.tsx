import { getDashboardStats, getAccessKey } from '@/lib/actions/admin';
import Badge from '@/components/ui/Badge';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const accessKey = await getAccessKey();

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center">
              <svg className="w-5.5 h-5.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Submissions</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center">
              <svg className="w-5.5 h-5.5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Custom Fields</p>
              <p className="text-2xl font-semibold text-gray-900">{stats.customFieldCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-lg bg-green-50 flex items-center justify-center">
              <svg className="w-5.5 h-5.5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-gray-500">Access Key</p>
              <div className="flex items-center gap-2 mt-0.5">
                <Badge variant="success">Active</Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-sm font-semibold text-gray-900">Active Access Key</h2>
        </div>
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <code className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-mono text-gray-800 flex-1">
              {accessKey}
            </code>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Share this key with participants at the start of each session.
          </p>
        </div>
      </div>
    </div>
  );
}
