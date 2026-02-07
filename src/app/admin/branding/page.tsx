import { getBranding } from '@/lib/actions/admin';
import Card from '@/components/ui/Card';
import BrandingEditor from '@/components/admin/BrandingEditor';

export default async function AdminBrandingPage() {
  const branding = await getBranding();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Branding & Appearance</h1>
      <Card
        header={
          <div>
            <h2 className="text-base font-medium text-gray-900">Front Page Customization</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Customize how the public-facing pages appear to participants.
            </p>
          </div>
        }
      >
        <BrandingEditor branding={branding} />
      </Card>
    </div>
  );
}
