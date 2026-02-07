import Card from '@/components/ui/Card';
import AccessKeyForm from '@/components/AccessKeyForm';
import { getBranding } from '@/lib/actions/admin';

export default async function Home() {
  const branding = await getBranding();

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-slate-50 to-gray-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {branding.logo_url && (
            <div className="mb-5 flex justify-center">
              <img
                src={branding.logo_url}
                alt={branding.company_name}
                className="h-14 w-auto object-contain"
              />
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
            {branding.company_name}
          </h1>
          {branding.tagline && (
            <p className="text-sm text-gray-500 mt-1">{branding.tagline}</p>
          )}
        </div>

        <Card>
          <div className="mb-5">
            <h2 className="text-lg font-medium text-gray-800">{branding.page_heading}</h2>
            <p className="text-sm text-gray-500 mt-1 leading-relaxed">
              {branding.page_description}
            </p>
          </div>
          <AccessKeyForm />
        </Card>

        <p className="text-center text-xs text-gray-400 mt-8">
          Only authorized training participants may submit this form.
        </p>
      </div>
    </main>
  );
}
