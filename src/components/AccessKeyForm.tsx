'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { validateAccessKey } from '@/lib/actions/access-key';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function AccessKeyForm() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setError(null);
    setLoading(true);
    try {
      const result = await validateAccessKey(formData);
      if (result.success) {
        router.push('/form');
      } else {
        setError(result.error || 'Invalid access key');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        name="key"
        label="Training Access Key"
        placeholder="Enter the access key provided by your instructor"
        required
        autoFocus
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" loading={loading} className="w-full">
        Continue
      </Button>
    </form>
  );
}
