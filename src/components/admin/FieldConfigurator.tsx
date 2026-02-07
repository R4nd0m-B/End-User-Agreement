'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { addCustomField, updateCustomField, removeCustomField, reorderFields } from '@/lib/actions/fields';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import type { CustomField } from '@/lib/types';

interface FieldConfiguratorProps {
  fields: CustomField[];
}

export default function FieldConfigurator({ fields: initialFields }: FieldConfiguratorProps) {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const router = useRouter();

  async function handleAdd(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await addCustomField(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Field added' });
        setShowAddForm(false);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to add field' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(formData: FormData) {
    setMessage(null);
    setLoading(true);
    try {
      const result = await updateCustomField(formData);
      if (result.success) {
        setMessage({ type: 'success', text: 'Field updated' });
        setEditingId(null);
        router.refresh();
      } else {
        setMessage({ type: 'error', text: result.error || 'Failed to update field' });
      }
    } catch {
      setMessage({ type: 'error', text: 'An unexpected error occurred' });
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove(id: number) {
    setMessage(null);
    const result = await removeCustomField(id);
    if (result.success) {
      setMessage({ type: 'success', text: 'Field removed' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error || 'Failed to remove' });
    }
  }

  async function handleMoveUp(index: number) {
    if (index === 0) return;
    const ids = initialFields.map((f) => f.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    await reorderFields(ids);
    router.refresh();
  }

  async function handleMoveDown(index: number) {
    if (index === initialFields.length - 1) return;
    const ids = initialFields.map((f) => f.id);
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    await reorderFields(ids);
    router.refresh();
  }

  function renderFieldRow(field: CustomField, index: number) {
    if (editingId === field.id) {
      return (
        <div key={field.id} className="py-3 border border-blue-100 rounded-lg px-4 bg-blue-50/30">
          <form action={handleEdit} className="space-y-3">
            <input type="hidden" name="id" value={field.id} />
            <div className="grid grid-cols-2 gap-3">
              <Input name="label" label="Label" defaultValue={field.label} required />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select name="field_type" defaultValue={field.field_type}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </div>
            </div>
            <Input name="placeholder" label="Placeholder" defaultValue={field.placeholder || ''} />
            <div className="flex items-center gap-2">
              <input type="checkbox" id={`req_${field.id}`} name="is_required" value="1" defaultChecked={field.is_required === 1} className="rounded border-gray-300" />
              <label htmlFor={`req_${field.id}`} className="text-sm text-gray-700">Required</label>
            </div>
            <Input name="options" label="Options (comma-separated, for select)" defaultValue={field.options || ''} />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={loading}>Save</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditingId(null)}>Cancel</Button>
            </div>
          </form>
        </div>
      );
    }

    return (
      <div key={field.id} className="py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <button onClick={() => handleMoveUp(index)} disabled={index === 0}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5" aria-label="Move up">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            </button>
            <button onClick={() => handleMoveDown(index)} disabled={index === initialFields.length - 1}
              className="text-gray-400 hover:text-gray-600 disabled:opacity-20 p-0.5" aria-label="Move down">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{field.label}</p>
            <p className="text-xs text-gray-400">
              {field.field_name} &middot; {field.field_type}
              {field.is_required === 1 && ' · required'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Badge>{field.field_type}</Badge>
          <Button variant="ghost" size="sm" onClick={() => setEditingId(field.id)}>Edit</Button>
          <Button variant="danger" size="sm" onClick={() => handleRemove(field.id)}>Remove</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {initialFields.length === 0 ? (
        <p className="text-gray-400 text-sm py-4">No custom fields configured yet.</p>
      ) : (
        <div className="divide-y divide-gray-100">
          {initialFields.map((field, index) => renderFieldRow(field, index))}
        </div>
      )}

      {message && <Alert variant={message.type}>{message.text}</Alert>}

      {showAddForm ? (
        <div className="border border-gray-200 rounded-lg p-4 space-y-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-800">New Field</h3>
          <form action={handleAdd} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input name="field_name" label="Field Name (slug)" placeholder="e.g. department" required />
              <Input name="label" label="Display Label" placeholder="e.g. Department" required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="field_type" className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select id="field_type" name="field_type"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="text">Text</option>
                  <option value="email">Email</option>
                  <option value="tel">Phone</option>
                  <option value="textarea">Textarea</option>
                  <option value="select">Select</option>
                </select>
              </div>
              <Input name="placeholder" label="Placeholder" placeholder="Optional" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="is_required" name="is_required" value="1" className="rounded border-gray-300" />
              <label htmlFor="is_required" className="text-sm text-gray-700">Required</label>
            </div>
            <Input name="options" label="Options (comma-separated, for select)" placeholder="Option A, Option B" />
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={loading}>Add Field</Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAddForm(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      ) : (
        <Button variant="secondary" size="sm" onClick={() => setShowAddForm(true)}>
          Add Custom Field
        </Button>
      )}
    </div>
  );
}
