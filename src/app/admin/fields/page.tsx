import { getCustomFields } from '@/lib/actions/fields';
import Card from '@/components/ui/Card';
import FieldConfigurator from '@/components/admin/FieldConfigurator';

export default async function AdminFieldsPage() {
  const fields = await getCustomFields();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Custom Form Fields</h1>
      <Card
        header={
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Field Configuration</h2>
            <p className="text-sm text-gray-500 mt-1">
              Add, remove, or reorder custom fields that appear on the registration form.
            </p>
          </div>
        }
      >
        <FieldConfigurator fields={fields} />
      </Card>
    </div>
  );
}
