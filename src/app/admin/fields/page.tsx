import { getCustomFields } from '@/lib/actions/fields';
import Card from '@/components/ui/Card';
import FieldConfigurator from '@/components/admin/FieldConfigurator';

export default async function AdminFieldsPage() {
  const fields = await getCustomFields();

  return (
    <div>
      <Card
        header={
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Field Configuration</h2>
            <p className="text-xs text-gray-500 mt-0.5">
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
