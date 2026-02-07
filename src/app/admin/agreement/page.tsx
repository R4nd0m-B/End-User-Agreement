import { getActiveAgreement, getAgreementHistory } from '@/lib/actions/agreement';
import Card from '@/components/ui/Card';
import AgreementEditor from '@/components/admin/AgreementEditor';
import VersionHistory from '@/components/admin/VersionHistory';

export default async function AdminAgreementPage() {
  const agreement = await getActiveAgreement();
  const history = await getAgreementHistory();

  if (!agreement) {
    return (
      <div>
        <p className="text-gray-500 text-sm">No agreement found. Check database initialization.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card header={<h2 className="text-sm font-semibold text-gray-900">Edit Current Agreement</h2>}>
        <AgreementEditor agreement={agreement} />
      </Card>

      <Card header={<h2 className="text-sm font-semibold text-gray-900">Version History</h2>}>
        <VersionHistory history={history} />
      </Card>
    </div>
  );
}
