import { getAccessKey } from '@/lib/actions/admin';
import Card from '@/components/ui/Card';
import AccessKeyManager from '@/components/admin/AccessKeyManager';
import ChangePasswordForm from '@/components/admin/ChangePasswordForm';

export default async function AdminSettingsPage() {
  const accessKey = await getAccessKey();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-6">
        <Card header={<h2 className="text-lg font-semibold text-gray-900">Access Key Management</h2>}>
          <AccessKeyManager currentKey={accessKey} />
        </Card>

        <Card header={<h2 className="text-lg font-semibold text-gray-900">Change Admin Password</h2>}>
          <ChangePasswordForm />
        </Card>
      </div>
    </div>
  );
}
