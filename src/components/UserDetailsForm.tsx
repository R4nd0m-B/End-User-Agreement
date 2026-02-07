'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { submitForm } from '@/lib/actions/submission';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import AgreementDisplay from '@/components/AgreementDisplay';
import type { Agreement, CustomField } from '@/lib/types';

interface UserDetailsFormProps {
  agreement: Agreement;
  customFields: CustomField[];
}

export default function UserDetailsForm({ agreement, customFields }: UserDetailsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const result = await submitForm(formData);
      if (result.success && result.data) {
        router.push(`/confirmation?id=${result.data.userId}`);
      } else {
        setError(result.error || 'Submission failed');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  function renderCustomField(field: CustomField) {
    const name = `custom_${field.field_name}`;
    const commonProps = {
      name,
      label: field.label,
      placeholder: field.placeholder || undefined,
      required: field.is_required === 1,
    };

    switch (field.field_type) {
      case 'textarea':
        return <Textarea key={field.id} {...commonProps} rows={3} />;
      case 'select': {
        const options: string[] = field.options ? JSON.parse(field.options) : [];
        return (
          <div key={field.id} className="w-full">
            <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
              {field.label}
              {field.is_required === 1 && <span className="text-red-500 ml-1">*</span>}
            </label>
            <select
              id={name}
              name={name}
              required={field.is_required === 1}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select...</option>
              {options.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        );
      }
      default:
        return (
          <Input
            key={field.id}
            type={field.field_type}
            {...commonProps}
          />
        );
    }
  }

  return (
    <form action={handleSubmit} className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Details</h2>
        <div className="space-y-4">
          <Input name="fullName" label="Full Name" placeholder="Enter your full name" required />
          <Input name="email" type="email" label="Email Address" placeholder="Enter your email address" required />
          <Input name="phone" type="tel" label="Phone Number" placeholder="Enter your phone number" required />
        </div>
      </div>

      {customFields.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          <div className="space-y-4">
            {customFields.map(renderCustomField)}
          </div>
        </div>
      )}

      <div className="border-t border-gray-200 pt-6">
        <AgreementDisplay
          title={agreement.title}
          content={agreement.content}
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <Button type="submit" loading={loading} className="w-full" size="lg">
        Submit Agreement
      </Button>
    </form>
  );
}
