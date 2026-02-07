import { redirect } from 'next/navigation';
import { verifyAccessCookie } from '@/lib/auth';
import { getActiveAgreement } from '@/lib/actions/agreement';
import { getCustomFields } from '@/lib/actions/fields';
import { getBranding } from '@/lib/actions/admin';
import Card from '@/components/ui/Card';
import UserDetailsForm from '@/components/UserDetailsForm';

export default async function FormPage() {
  const hasAccess = await verifyAccessCookie();
  if (!hasAccess) {
    redirect('/');
  }

  const [agreement, customFields, branding] = await Promise.all([
    getActiveAgreement(),
    getCustomFields(),
    getBranding(),
  ]);

  if (!agreement) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-2xl text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-3">Configuration Required</h1>
          <p className="text-gray-500 text-sm">No active agreement found. Please contact your administrator.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen py-12 px-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          {branding.logo_url && (
            <div className="mb-4 flex justify-center">
              <img src={branding.logo_url} alt={branding.company_name} className="h-10 w-auto object-contain" />
            </div>
          )}
          <h1 className="text-xl font-semibold text-gray-900">{branding.form_heading}</h1>
          <p className="text-gray-500 text-sm mt-1">{branding.form_description}</p>
        </div>
        <Card>
          <UserDetailsForm agreement={agreement} customFields={customFields} />
        </Card>
      </div>
    </main>
  );
}
