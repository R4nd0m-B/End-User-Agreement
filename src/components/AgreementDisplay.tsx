'use client';

import Checkbox from '@/components/ui/Checkbox';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface AgreementDisplayProps {
  title: string;
  content: string;
  error?: string;
}

export default function AgreementDisplay({ title, content, error }: AgreementDisplayProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      </div>
      <div className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white text-sm text-gray-700 leading-relaxed agreement-scroll">
        <MarkdownRenderer content={content} />
      </div>
      <Checkbox
        name="agreementAccepted"
        label="I have read and agree to the Ethical Use and User License Agreement"
        required
        error={error}
      />
    </div>
  );
}
