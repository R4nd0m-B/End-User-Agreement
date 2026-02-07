'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { updateAgreement } from '@/lib/actions/agreement';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import MarkdownEditor from '@/components/admin/TiptapEditor';
import type { Agreement } from '@/lib/types';

interface AgreementEditorProps {
  agreement: Agreement;
}

export default function AgreementEditor({ agreement }: AgreementEditorProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(agreement.content);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const title = formData.get('title') as string;

      const newFormData = new FormData();
      newFormData.append('title', title);
      newFormData.append('content', content);

      const result = await updateAgreement(newFormData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Agreement saved successfully' });
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update agreement' });
      }
    } catch (error) {
      console.error('Submit error:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <Input
        name="title"
        label="Agreement Title"
        defaultValue={agreement.title}
        required
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Agreement Content
        </label>

        <MarkdownEditor
          content={agreement.content}
          onChange={setContent}
        />
      </div>

      {message && <Alert variant={message.type}>{message.text}</Alert>}
      <div className="flex items-center justify-end">
        <Button type="submit" loading={loading}>
          Save Agreement
        </Button>
      </div>
    </form>
  );
}
