'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { setAccessKey, rotateAccessKey } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

interface AccessKeyManagerProps {
  currentKey: string;
}

export default function AccessKeyManager({ currentKey }: AccessKeyManagerProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSetKey(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await setAccessKey(formData);
      if (result.success) {
        setMessage({ type: 'success', text: `Access key updated successfully. New key: ${result.data?.key}` });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update key' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRotate() {
    setMessage(null);
    setLoading(true);
    try {
      const result = await rotateAccessKey();
      if (result.success) {
        setMessage({ type: 'success', text: `Key rotated. New key: ${result.data?.newKey}` });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to rotate key' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Access Key</h3>
        <div className="flex items-center gap-3">
          {currentKey ? (
            <>
              <code className="bg-gray-100 px-4 py-2 rounded-lg text-sm font-mono text-gray-900 flex-1">
                {currentKey}
              </code>
              <Button variant="secondary" size="sm" onClick={handleRotate} loading={loading}>
                Generate New
              </Button>
            </>
          ) : (
            <div className="flex-1 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3">
              <p className="text-sm text-amber-800">
                Current key is hidden for security. Generate a new key to see the access key.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Set Custom Key</h3>
        <form action={handleSetKey} className="flex items-end gap-3">
          <div className="flex-1">
            <Input name="key" placeholder="Enter a custom access key" required />
          </div>
          <Button type="submit" variant="secondary" loading={loading}>
            Set Key
          </Button>
        </form>
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}
    </div>
  );
}
