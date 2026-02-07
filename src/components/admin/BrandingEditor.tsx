'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateBranding } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import type { Branding } from '@/lib/types';

interface BrandingEditorProps {
  branding: Branding;
}

export default function BrandingEditor({ branding }: BrandingEditorProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await updateBranding(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Branding updated successfully' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update branding' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="company_name" label="Company Name" defaultValue={branding.company_name} required />
        <Input name="tagline" label="Tagline" defaultValue={branding.tagline} placeholder="e.g. Training & Certification" />
      </div>

      <Input name="logo_url" label="Logo URL" defaultValue={branding.logo_url} placeholder="https://example.com/logo.png" />

      <Input name="primary_color" label="Primary Color" type="color" defaultValue={branding.primary_color} />

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Landing Page</p>
        <div className="space-y-4">
          <Input name="page_heading" label="Heading" defaultValue={branding.page_heading} required />
          <Textarea name="page_description" label="Description" defaultValue={branding.page_description} rows={2} />
        </div>
      </div>

      <div className="border-t border-gray-100 pt-5">
        <p className="text-sm font-medium text-gray-700 mb-3">Registration Form Page</p>
        <div className="space-y-4">
          <Input name="form_heading" label="Heading" defaultValue={branding.form_heading} required />
          <Textarea name="form_description" label="Description" defaultValue={branding.form_description} rows={2} />
        </div>
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="flex justify-end pt-2">
        <Button type="submit" loading={loading}>Save Changes</Button>
      </div>
    </form>
  );
}
