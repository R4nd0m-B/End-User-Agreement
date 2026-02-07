'use client';

import { useState, useRef } from 'react';

interface ReactMDEEditorProps {
  content: string;
  onChange: (content: string) => void;
}

export default function ReactMDEEditor({ content, onChange }: ReactMDEEditorProps) {
  const [value, setValue] = useState(content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newValue = value.substring(0, start) + before + selectedText + after + value.substring(end);

    setValue(newValue);
    onChange(newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const makeBold = () => insertFormatting('**', '**');
  const makeItalic = () => insertFormatting('*', '*');
  const makeHeading = () => insertFormatting('# ');
  const addBulletPoint = () => insertFormatting('• ');

  return (
    <div className="space-y-2">
      <div className="flex gap-2 p-2 bg-gray-100 rounded-t-lg border border-gray-300 border-b-0">
        <button
          type="button"
          onClick={makeBold}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-sm"
          title="Bold"
        >
          B
        </button>
        <button
          type="button"
          onClick={makeItalic}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 italic text-sm"
          title="Italic"
        >
          I
        </button>
        <button
          type="button"
          onClick={makeHeading}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 font-bold text-sm"
          title="Heading"
        >
          H
        </button>
        <button
          type="button"
          onClick={addBulletPoint}
          className="px-3 py-1 bg-white border border-gray-300 rounded hover:bg-gray-50 text-sm"
          title="Bullet Point"
        >
          •
        </button>
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        className="w-full h-96 p-3 border border-gray-300 rounded-b-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Enter your content here..."
      />
    </div>
  );
}
