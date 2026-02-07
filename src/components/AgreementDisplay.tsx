'use client';

import Checkbox from '@/components/ui/Checkbox';

interface AgreementDisplayProps {
  title: string;
  content: string;
  error?: string;
}

function formatContent(content: string) {
  return content
    .split('\n')
    .map((line) => {
      // Handle headings (# text)
      if (line.startsWith('# ')) {
        return `<h2 class="text-xl font-bold mt-3 mb-2">${line.replace(/^# /, '')}</h2>`;
      }
      // Handle bold (**text**)
      line = line.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
      // Handle italic (*text*)
      line = line.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
      // Handle bullet points (• text)
      if (line.startsWith('• ')) {
        return `<div class="ml-4 mb-1">• ${line.replace(/^• /, '')}</div>`;
      }
      return `<div class="mb-2">${line || '&nbsp;'}</div>`;
    })
    .join('');
}

export default function AgreementDisplay({ title, content, error }: AgreementDisplayProps) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
      </div>
      <div
        className="max-h-80 overflow-y-auto border border-gray-200 rounded-lg p-4 bg-white text-sm text-gray-700 leading-relaxed"
        dangerouslySetInnerHTML={{ __html: formatContent(content) }}
      />
      <Checkbox
        name="agreementAccepted"
        label="I have read and agree to the Ethical Use and User License Agreement"
        required
        error={error}
      />
    </div>
  );
}
