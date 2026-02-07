'use client';

import { useState } from 'react';
import { setAdminPath } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

interface AdminPathManagerProps {
  currentPath: string;
}

export default function AdminPathManager({ currentPath }: AdminPathManagerProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSetPath(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await setAdminPath(formData);
      if (result.success) {
        setMessage({
          type: 'success',
          text: `Admin path updated to: /${result.data?.path}. Redirecting...`
        });
        // Redirect after 2 seconds to new path
        setTimeout(() => {
          window.location.href = `/${result.data?.path}`;
        }, 2000);
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update path' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-2">Current Admin Path</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <p className="text-sm text-blue-900 font-mono">
            /{currentPath}
          </p>
          <p className="text-xs text-blue-700 mt-2">
            Access your admin panel at this path. The default /admin path will be blocked.
          </p>
        </div>
      </div>

      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Change Admin Path</h3>
        <form action={handleSetPath} className="flex items-end gap-3">
          <div className="flex-1">
            <label htmlFor="path" className="block text-xs font-medium text-gray-600 mb-1.5">
              New Path (alphanumeric, hyphens, underscores only)
            </label>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">/</span>
              <Input
                id="path"
                name="path"
                placeholder="e.g., secure-admin, control-panel"
                required
                minLength={3}
                pattern="[a-zA-Z0-9\-_]+"
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" loading={loading}>
            Update Path
          </Button>
        </form>
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mt-4">
        <p className="text-xs text-amber-800">
          <strong>Security Note:</strong> Changing the admin path prevents brute-force attempts on the default /admin path. Choose a unique, hard-to-guess path.
        </p>
      </div>
    </div>
  );
}
