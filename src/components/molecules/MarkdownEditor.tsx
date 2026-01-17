import { useState, useRef } from 'react';
import { Bold, Italic, Link, Code, List, Heading1, Eye, Split, FileText } from 'lucide-react';
import { cn } from '../../lib/utils';
import MarkdownRenderer from './MarkdownRenderer';

type ViewMode = 'split' | 'edit' | 'preview';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  className?: string;
}

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Write your note content here (supports Markdown)',
  minHeight = '400px',
  className,
}: MarkdownEditorProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);

    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertText('**', '**');
    }
    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertText('_', '_');
    }
    // Cmd/Ctrl + K for link
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      insertText('[', '](url)');
    }
  };

  const calculateReadingTime = (text: string): number => {
    const wordsPerMinute = 200;
    const words = text.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  };

  const wordCount = value.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = value.length;
  const readingTime = calculateReadingTime(value);

  return (
    <div className={cn('flex flex-col border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => insertText('**', '**')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Bold (Cmd/Ctrl+B)"
            aria-label="Bold"
          >
            <Bold size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => insertText('_', '_')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Italic (Cmd/Ctrl+I)"
            aria-label="Italic"
          >
            <Italic size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => insertText('[', '](url)')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Link (Cmd/Ctrl+K)"
            aria-label="Link"
          >
            <Link size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => insertText('`', '`')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Inline Code"
            aria-label="Inline Code"
          >
            <Code size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => insertText('- ', '')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Bullet List"
            aria-label="Bullet List"
          >
            <List size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
          <button
            type="button"
            onClick={() => insertText('# ', '')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition"
            title="Heading"
            aria-label="Heading"
          >
            <Heading1 size={16} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {wordCount} words · {charCount} chars · {readingTime} min read
          </div>
          <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-700 pl-2 ml-2">
            <button
              type="button"
              onClick={() => setViewMode('edit')}
              className={cn(
                'p-2 rounded transition',
                viewMode === 'edit'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
              title="Edit Mode"
              aria-label="Edit Mode"
            >
              <FileText size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={cn(
                'p-2 rounded transition',
                viewMode === 'split'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
              title="Split View"
              aria-label="Split View"
            >
              <Split size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={cn(
                'p-2 rounded transition',
                viewMode === 'preview'
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                  : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
              )}
              title="Preview Mode"
              aria-label="Preview Mode"
            >
              <Eye size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Editor/Preview Area */}
      <div className="flex flex-1 overflow-hidden" style={{ minHeight }}>
        {/* Editor */}
        {(viewMode === 'edit' || viewMode === 'split') && (
          <div className={cn('flex-1 flex flex-col', viewMode === 'split' && 'border-r border-gray-200 dark:border-gray-700')}>
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="flex-1 w-full px-4 py-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm resize-none focus:outline-none"
              style={{ minHeight }}
            />
          </div>
        )}

        {/* Preview */}
        {(viewMode === 'preview' || viewMode === 'split') && (
          <div className={cn('flex-1 overflow-y-auto px-4 py-3 bg-gray-50 dark:bg-gray-900', viewMode === 'preview' && 'w-full')}>
            {value.trim() ? (
              <MarkdownRenderer content={value} />
            ) : (
              <p className="text-gray-400 dark:text-gray-500 italic">{placeholder}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
