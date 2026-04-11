import { Link } from 'react-router-dom';
import type { Components } from 'react-markdown';
import { cn } from '@/lib/utils';

const headingBase =
  '!mt-4 !mb-2 first:!mt-0 font-semibold font-sans tracking-tight text-gray-900 dark:text-gray-100';

/**
 * Stable markdown component map for assistant chat bubbles (avoids new object identity each render).
 * Headings/blockquote are plain (no CollapsibleHeading / MarkdownContentWrapper — those are for long-form docs).
 */
export const chatMessageMarkdownComponents: Partial<Components> = {
  h1: ({ children, className }) => (
    <h1 className={cn(headingBase, 'text-xl', className)}>{children}</h1>
  ),
  h2: ({ children, className }) => (
    <h2 className={cn(headingBase, 'text-lg', className)}>{children}</h2>
  ),
  h3: ({ children, className }) => (
    <h3 className={cn(headingBase, 'text-base', className)}>{children}</h3>
  ),
  h4: ({ children, className }) => (
    <h4 className={cn(headingBase, 'text-sm', className)}>{children}</h4>
  ),
  blockquote: ({ children, className }) => (
    <blockquote
      className={cn(
        '!mt-0 !mb-2 border-l-4 border-gray-300 dark:border-gray-600 pl-3 py-0.5 text-gray-700 dark:text-gray-300',
        className
      )}
    >
      {children}
    </blockquote>
  ),
  p: ({ children }) => <p className="!mt-0 !mb-2 last:!mb-0">{children}</p>,
  strong: ({ children, className }) => (
    <strong className={cn('font-semibold text-gray-900 dark:text-gray-100', className)}>
      {children}
    </strong>
  ),
  em: ({ children, className }) => <em className={cn('italic', className)}>{children}</em>,
  ul: ({ children }) => (
    <ul
      className={cn(
        '!mt-0 !mb-2 list-disc list-outside pl-6 space-y-1 [&>li]:list-item',
        '[&_ul]:!mt-1 [&_ul]:!mb-0 [&_ul]:list-[circle] [&_ul]:pl-6',
        '[&_ul_ul]:list-[square]',
        '[&_ul_ul_ul]:list-[disc]'
      )}
    >
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol
      className={cn(
        '!mt-0 !mb-2 list-decimal list-outside pl-6 space-y-1 [&>li]:list-item',
        '[&_ol]:!mt-1 [&_ol]:!mb-0 [&_ol]:list-[lower-alpha] [&_ol]:pl-6',
        '[&_ol_ol]:list-[lower-roman]'
      )}
    >
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="list-item leading-relaxed min-h-[1em] [&>p]:!m-0">{children}</li>
  ),
  a: ({ ...props }) => {
    const href = props.href || '';
    if (href.startsWith('/')) {
      return (
        <Link to={href} className="text-blue-600 dark:text-blue-400 hover:underline font-medium">
          {props.children}
        </Link>
      );
    }
    return (
      <a
        {...props}
        className="text-blue-600 dark:text-blue-400 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {props.children}
      </a>
    );
  },
};
