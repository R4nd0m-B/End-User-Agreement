import { getDashboardStats, getAccessKey } from '@/lib/actions/admin';
import Card from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';

export default async function AdminDashboard() {
  const stats = await getDashboardStats();
  const accessKey = await getAccessKey();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Total Submissions</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.totalSubmissions}</p>
          </div>
        </Card>
        <Card>
          <div>
            <p className="text-sm text-gray-500 mb-1">Custom Fields</p>
            <p className="text-2xl font-semibold text-gray-900">{stats.customFieldCount}</p>
          </div>
        </Card>
      </div>

      <Card header={<h2 className="text-base font-medium text-gray-900">Active Access Key</h2>}>
        <div className="flex items-center gap-3">
          <code className="bg-gray-50 border border-gray-200 px-4 py-2 rounded text-sm font-mono text-gray-800 flex-1">
            {accessKey}
          </code>
          <Badge variant="success">Active</Badge>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Share this key with participants at the start of each session.
        </p>
      </Card>
    </div>
  );
}
