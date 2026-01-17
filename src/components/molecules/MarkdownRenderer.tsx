import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import { cn } from '../../lib/utils';

// Dynamic imports for optional dependencies
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let remarkMath: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let rehypeKatex: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Prism: any = null;

const loadMathSupport = async () => {
  if (typeof window !== 'undefined') {
    try {
      if (!remarkMath) {
        remarkMath = (await import('remark-math')).default;
      }
      if (!rehypeKatex) {
        rehypeKatex = (await import('rehype-katex')).default;
        // Import KaTeX CSS
        await import('katex/dist/katex.min.css');
      }
    } catch {
      // Math support not available - packages need to be installed
      // Install with: npm install remark-math rehype-katex katex
    }
  }
  return { remarkMath, rehypeKatex };
};

const loadPrism = async () => {
  if (typeof window !== 'undefined' && !Prism) {
    try {
      const prism = await import('prismjs');
      Prism = prism.default;

      // Import Prism CSS (will use custom dark mode styles from index.css)
      await import('prismjs/themes/prism-tomorrow.css');

      // Load common language support
      const languages = [
        'javascript',
        'typescript',
        'python',
        'java',
        'cpp',
        'c',
        'csharp',
        'go',
        'rust',
        'php',
        'ruby',
        'swift',
        'kotlin',
        'sql',
        'bash',
        'json',
        'yaml',
        'markdown',
        'css',
        'html',
        'jsx',
        'tsx',
      ];

      for (const lang of languages) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          await import(/* @vite-ignore */ `prismjs/components/prism-${lang}`);
        } catch {
          // Language not available, skip
        }
      }
    } catch {
      // Syntax highlighting not available - packages need to be installed
      // Install with: npm install prismjs @types/prismjs
    }
  }
  return Prism;
};

interface MarkdownRendererProps {
  content: string;
  className?: string;
  components?: Partial<Components>;
}

export default function MarkdownRenderer({
  content,
  className,
  components: customComponents,
}: MarkdownRendererProps) {
  const codeRefs = useRef<Map<string, HTMLPreElement>>(new Map());
  const [mathLoaded, setMathLoaded] = useState(false);
  const [prismLoaded, setPrismLoaded] = useState(false);

  useEffect(() => {
    // Load math support
    loadMathSupport().then(() => {
      setMathLoaded(true);
    });

    // Load Prism and highlight code blocks
    loadPrism().then((prism) => {
      if (prism) {
        setPrismLoaded(true);
        // Highlight existing code blocks
        setTimeout(() => {
          codeRefs.current.forEach((preElement) => {
            const codeElement = preElement.querySelector('code');
            if (codeElement && !codeElement.classList.contains('prism-highlighted')) {
              const language =
                codeElement.getAttribute('data-language') ||
                codeElement.className.replace(/language-?/, '');
              if (language && prism.languages[language]) {
                try {
                  const code = codeElement.textContent || '';
                  codeElement.innerHTML = prism.highlight(
                    code,
                    prism.languages[language],
                    language
                  );
                  codeElement.classList.add('prism-highlighted');
                } catch {
                  // Failed to highlight, continue without highlighting
                }
              }
            }
          });
        }, 0);
      }
    });
  }, [content]);

  // Build plugins array dynamically
  const remarkPlugins = [remarkGfm];
  const rehypePlugins = [rehypeRaw];

  if (mathLoaded && remarkMath) {
    remarkPlugins.push(remarkMath);
  }
  if (mathLoaded && rehypeKatex) {
    rehypePlugins.push(rehypeKatex);
  }

  const defaultComponents: Partial<Components> = {
    // Lists
    ul({ className, children, ...props }) {
      return (
        <ul className={cn('my-4 list-disc space-y-2', className)} {...props}>
          {children}
        </ul>
      );
    },
    ol({ className, children, ...props }) {
      return (
        <ol className={cn('my-4 list-decimal space-y-2', className)} {...props}>
          {children}
        </ol>
      );
    },
    li({ className, children, ...props }) {
      return (
        <li className={cn(className)} {...props}>
          {children}
        </li>
      );
    },
    // Paragraphs
    p({ className, children, ...props }) {
      return (
        <p className={cn('my-4 leading-relaxed', className)} {...props}>
          {children}
        </p>
      );
    },
    // Headings
    h1({ className, children, ...props }) {
      return (
        <h1 className={cn('text-3xl font-bold mt-8 mb-4 font-serif', className)} {...props}>
          {children}
        </h1>
      );
    },
    h2({ className, children, ...props }) {
      return (
        <h2 className={cn('text-2xl font-bold mt-6 mb-3 font-serif', className)} {...props}>
          {children}
        </h2>
      );
    },
    h3({ className, children, ...props }) {
      return (
        <h3 className={cn('text-xl font-semibold mt-5 mb-2 font-serif', className)} {...props}>
          {children}
        </h3>
      );
    },
    h4({ className, children, ...props }) {
      return (
        <h4 className={cn('text-lg font-semibold mt-4 mb-2 font-serif', className)} {...props}>
          {children}
        </h4>
      );
    },
    // Code blocks
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      const isInline = !className || !className.includes('language-');

      if (isInline) {
        return (
          <code
            className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded text-sm font-mono"
            {...props}
          >
            {children}
          </code>
        );
      }

      const codeId = `code-${Math.random().toString(36).substr(2, 9)}`;

      return (
        <pre
          ref={(el) => {
            if (el) {
              codeRefs.current.set(codeId, el);
              // Try to highlight immediately if Prism is loaded
              if (prismLoaded && Prism) {
                setTimeout(() => {
                  const codeEl = el.querySelector('code');
                  if (codeEl && !codeEl.classList.contains('prism-highlighted')) {
                    const lang = language || codeEl.className.replace(/language-?/, '');
                    if (lang && Prism.languages[lang]) {
                      try {
                        codeEl.innerHTML = Prism.highlight(
                          codeEl.textContent || '',
                          Prism.languages[lang],
                          lang
                        );
                        codeEl.classList.add('prism-highlighted');
                      } catch {
                        // Ignore highlighting errors
                      }
                    }
                  }
                }, 0);
              }
            } else {
              codeRefs.current.delete(codeId);
            }
          }}
          className="bg-gray-900 dark:bg-gray-950 rounded-lg p-4 overflow-x-auto my-4"
          data-language={language}
        >
          <code
            id={codeId}
            className={cn(
              'block text-sm font-mono text-gray-100',
              language && `language-${language}`
            )}
            data-language={language}
            {...props}
          >
            {children}
          </code>
        </pre>
      );
    },
    // Blockquotes
    blockquote({ className, children, ...props }) {
      return (
        <blockquote
          className={cn(
            'border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4',
            className
          )}
          {...props}
        >
          {children}
        </blockquote>
      );
    },
    // Tables
    table({ className, children, ...props }) {
      return (
        <div className="overflow-x-auto my-4">
          <table
            className={cn(
              'min-w-full border-collapse border border-gray-300 dark:border-gray-700',
              className
            )}
            {...props}
          >
            {children}
          </table>
        </div>
      );
    },
    th({ className, children, ...props }) {
      return (
        <th
          className={cn(
            'border border-gray-300 dark:border-gray-700 px-4 py-2 bg-gray-100 dark:bg-gray-800 font-semibold text-left',
            className
          )}
          {...props}
        >
          {children}
        </th>
      );
    },
    td({ className, children, ...props }) {
      return (
        <td
          className={cn('border border-gray-300 dark:border-gray-700 px-4 py-2', className)}
          {...props}
        >
          {children}
        </td>
      );
    },
    // Links
    a({ className, href, children, ...props }) {
      return (
        <a
          href={href}
          className={cn('text-blue-600 dark:text-blue-400 hover:underline', className)}
          {...props}
        >
          {children}
        </a>
      );
    },
    // Strong/Bold
    strong({ className, children, ...props }) {
      return (
        <strong className={cn('font-bold', className)} {...props}>
          {children}
        </strong>
      );
    },
    // Emphasis/Italic
    em({ className, children, ...props }) {
      return (
        <em className={cn('italic', className)} {...props}>
          {children}
        </em>
      );
    },
    // Horizontal rule
    hr({ className, ...props }) {
      return (
        <hr className={cn('my-8 border-gray-300 dark:border-gray-700', className)} {...props} />
      );
    },
  };

  // Merge custom components with defaults (custom takes precedence)
  const mergedComponents = {
    ...defaultComponents,
    ...customComponents,
    // Ensure code component is always from defaults (for syntax highlighting)
    code: defaultComponents.code,
  };

  return (
    <div
      className={cn(
        'prose prose-sm dark:prose-invert max-w-none prose-headings:font-serif',
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={remarkPlugins}
        rehypePlugins={rehypePlugins}
        components={mergedComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
