'use client';

import { useState, useRef, useCallback } from 'react';
import MarkdownRenderer from '@/components/MarkdownRenderer';

interface MarkdownEditorProps {
  content: string;
  onChange: (content: string) => void;
}

type Tab = 'write' | 'preview';

interface ToolbarAction {
  label: string;
  icon: React.ReactNode;
  action: (textarea: HTMLTextAreaElement, value: string) => { newValue: string; cursorStart: number; cursorEnd: number };
  title: string;
}

function wrapSelection(
  textarea: HTMLTextAreaElement,
  value: string,
  before: string,
  after: string = ''
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = value.substring(start, end);
  const newValue = value.substring(0, start) + before + selected + after + value.substring(end);
  return {
    newValue,
    cursorStart: start + before.length,
    cursorEnd: start + before.length + selected.length,
  };
}

function insertAtLineStart(
  textarea: HTMLTextAreaElement,
  value: string,
  prefix: string | ((lineIndex: number) => string)
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;

  // Find the start of the first selected line and end of the last
  const blockStart = value.lastIndexOf('\n', start - 1) + 1;
  const blockEnd = end;

  const selectedBlock = value.substring(blockStart, blockEnd);
  const lines = selectedBlock.split('\n');

  const prefixedLines = lines.map((line, i) => {
    const p = typeof prefix === 'function' ? prefix(i) : prefix;
    return p + line;
  });

  const newBlock = prefixedLines.join('\n');
  const newValue = value.substring(0, blockStart) + newBlock + value.substring(blockEnd);

  return {
    newValue,
    cursorStart: blockStart,
    cursorEnd: blockStart + newBlock.length,
  };
}

const toolbarGroups: (ToolbarAction | 'separator')[][] = [
  [
    {
      label: 'H1',
      title: 'Heading 1',
      icon: <span className="font-bold text-xs">H1</span>,
      action: (ta, v) => insertAtLineStart(ta, v, '# '),
    },
    {
      label: 'H2',
      title: 'Heading 2',
      icon: <span className="font-bold text-xs">H2</span>,
      action: (ta, v) => insertAtLineStart(ta, v, '## '),
    },
    {
      label: 'H3',
      title: 'Heading 3',
      icon: <span className="font-bold text-xs">H3</span>,
      action: (ta, v) => insertAtLineStart(ta, v, '### '),
    },
  ],
  [
    {
      label: 'Bold',
      title: 'Bold (Ctrl+B)',
      icon: <i className="fa-solid fa-bold text-xs" />,
      action: (ta, v) => wrapSelection(ta, v, '**', '**'),
    },
    {
      label: 'Italic',
      title: 'Italic (Ctrl+I)',
      icon: <i className="fa-solid fa-italic text-xs" />,
      action: (ta, v) => wrapSelection(ta, v, '*', '*'),
    },
    {
      label: 'Strikethrough',
      title: 'Strikethrough',
      icon: <i className="fa-solid fa-strikethrough text-xs" />,
      action: (ta, v) => wrapSelection(ta, v, '~~', '~~'),
    },
  ],
  [
    {
      label: 'Bullet List',
      title: 'Bullet List',
      icon: <i className="fa-solid fa-list-ul text-xs" />,
      action: (ta, v) => insertAtLineStart(ta, v, '- '),
    },
    {
      label: 'Numbered List',
      title: 'Numbered List',
      icon: <i className="fa-solid fa-list-ol text-xs" />,
      action: (ta, v) => insertAtLineStart(ta, v, (i) => `${i + 1}. `),
    },
  ],
  [
    {
      label: 'Blockquote',
      title: 'Blockquote',
      icon: <i className="fa-solid fa-quote-left text-xs" />,
      action: (ta, v) => insertAtLineStart(ta, v, '> '),
    },
    {
      label: 'Code',
      title: 'Inline Code',
      icon: <i className="fa-solid fa-code text-xs" />,
      action: (ta, v) => wrapSelection(ta, v, '`', '`'),
    },
    {
      label: 'Link',
      title: 'Insert Link',
      icon: <i className="fa-solid fa-link text-xs" />,
      action: (ta, v) => {
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const selected = v.substring(start, end);
        const linkText = selected || 'link text';
        const newValue = v.substring(0, start) + `[${linkText}](url)` + v.substring(end);
        return {
          newValue,
          cursorStart: start + linkText.length + 3,
          cursorEnd: start + linkText.length + 6,
        };
      },
    },
  ],
  [
    {
      label: 'Horizontal Rule',
      title: 'Horizontal Rule',
      icon: <i className="fa-solid fa-minus text-xs" />,
      action: (ta, v) => {
        const start = ta.selectionStart;
        const before = v.substring(0, start);
        const after = v.substring(start);
        const needsNewline = before.length > 0 && !before.endsWith('\n');
        const insert = (needsNewline ? '\n' : '') + '---\n';
        return {
          newValue: before + insert + after,
          cursorStart: start + insert.length,
          cursorEnd: start + insert.length,
        };
      },
    },
  ],
];

export default function MarkdownEditor({ content, onChange }: MarkdownEditorProps) {
  const [value, setValue] = useState(content);
  const [activeTab, setActiveTab] = useState<Tab>('write');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const executeAction = useCallback((action: ToolbarAction['action']) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const result = action(textarea, value);
    setValue(result.newValue);
    onChange(result.newValue);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
    }, 0);
  }, [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      const textarea = textareaRef.current;
      if (!textarea) return;

      if (e.key === 'b') {
        e.preventDefault();
        const result = wrapSelection(textarea, value, '**', '**');
        setValue(result.newValue);
        onChange(result.newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
        }, 0);
      } else if (e.key === 'i') {
        e.preventDefault();
        const result = wrapSelection(textarea, value, '*', '*');
        setValue(result.newValue);
        onChange(result.newValue);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(result.cursorStart, result.cursorEnd);
        }, 0);
      }
    }

    // Handle Tab key for indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      const textarea = textareaRef.current;
      if (!textarea) return;
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const newValue = value.substring(0, start) + '  ' + value.substring(end);
      setValue(newValue);
      onChange(newValue);
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + 2, start + 2);
      }, 0);
    }
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const lineCount = value.split('\n').length;

  return (
    <div className="rounded-lg border border-gray-300 overflow-hidden bg-white focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500 transition-shadow">
      {/* Tabs */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-gray-50">
        <div className="flex">
          <button
            type="button"
            onClick={() => setActiveTab('write')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === 'write'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Write
            {activeTab === 'write' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`px-4 py-2.5 text-sm font-medium transition-colors relative ${
              activeTab === 'preview'
                ? 'text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Preview
            {activeTab === 'preview' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
            )}
          </button>
        </div>
        <div className="pr-3 text-xs text-gray-400">
          Markdown supported
        </div>
      </div>

      {/* Toolbar - only in write mode */}
      {activeTab === 'write' && (
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-white flex-wrap">
          {toolbarGroups.map((group, gi) => (
            <div key={gi} className="flex items-center">
              {gi > 0 && (
                <div className="w-px h-5 bg-gray-200 mx-1.5" />
              )}
              {group.map((item, i) => {
                if (item === 'separator') return <div key={i} className="w-px h-5 bg-gray-200 mx-1" />;
                return (
                  <button
                    key={i}
                    type="button"
                    title={item.title}
                    onClick={() => executeAction(item.action)}
                    className="w-8 h-8 flex items-center justify-center rounded text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                  >
                    {item.icon}
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Content area */}
      {activeTab === 'write' ? (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="w-full h-96 p-4 text-sm text-gray-900 font-mono leading-relaxed resize-y focus:outline-none placeholder-gray-400"
          placeholder="Write your agreement content in Markdown..."
          spellCheck
        />
      ) : (
        <div className="h-96 overflow-y-auto p-5 agreement-scroll">
          {value.trim() ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-sm text-gray-400 italic">Nothing to preview yet.</p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 bg-gray-50 text-xs text-gray-400">
        <span>{lineCount} lines &middot; {wordCount} words</span>
        <span>Ctrl+B bold &middot; Ctrl+I italic &middot; Tab indent</span>
      </div>
    </div>
  );
}
