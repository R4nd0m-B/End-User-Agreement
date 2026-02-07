'use client';

import { useState } from 'react';
import { changeAdminPassword } from '@/lib/actions/admin';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ChangePasswordForm() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await changeAdminPassword(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Password changed successfully' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to change password' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input name="currentPassword" type="password" label="Current Password" required />
      <Input name="newPassword" type="password" label="New Password" placeholder="Minimum 6 characters" required />
      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <Button type="submit" loading={loading}>
        Change Password
      </Button>
    </form>
  );
}
