'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, Terminal, Code2 } from 'lucide-react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

function CodeBlockWrapper({ children }: { children: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  // Extract raw text from children for copying
  const extractText = (node: any): string => {
    if (typeof node === 'string') return node;
    if (Array.isArray(node)) return node.map(extractText).join('');
    if (node?.props?.children) return extractText(node.props.children);
    return '';
  };

  const handleCopy = () => {
    const textToCopy = extractText(children);
    if (textToCopy) {
      navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Inspect children to determine language if available
  let langLabel = 'CODE';
  if (React.isValidElement(children)) {
    const codeProps: any = children.props;
    const cls = codeProps?.className || '';
    const match = /language-(\w+)/.exec(cls);
    if (match && match[1]) {
      langLabel = match[1].toUpperCase();
    }
  }

  return (
    <div className="group relative my-4 rounded-xl border border-zinc-200/90 bg-zinc-950 text-zinc-100 shadow-md transition-all dark:border-zinc-800 overflow-hidden">
      {/* Code Card Top Bar */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 bg-zinc-900/90 px-3.5 py-2 text-xs">
        <div className="flex items-center gap-2">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="ml-2 font-mono text-[11px] font-bold tracking-wider text-zinc-400">
            {langLabel}
          </span>
        </div>

        <button
          onClick={handleCopy}
          aria-label="Copy code"
          className="flex items-center gap-1.5 rounded-md border border-zinc-700/60 bg-zinc-800/70 px-2.5 py-1 text-[11px] font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-white"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-emerald-400">Kopyalandı</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5 text-zinc-400" />
              <span>Kopyala</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="overflow-x-auto text-[13px] leading-relaxed font-mono">
        {children}
      </div>
    </div>
  );
}

export function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  if (!content) return null;

  return (
    <div className={`markdown-content max-w-none text-zinc-800 dark:text-zinc-200 ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Code elements (inline vs block)
          code({ className, children, ...props }) {
            const hasLang = /language-(\w+)/.test(className || '');
            const isBlock = hasLang || (className && className.includes('hljs'));

            if (!isBlock) {
              // High-contrast, beautifully styled inline code
              return (
                <code
                  className="rounded-md border border-slate-200/90 bg-slate-100 px-1.5 py-0.5 font-mono text-[0.88em] font-semibold text-indigo-700 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:border-slate-700/70 dark:bg-slate-800/90 dark:text-cyan-300 dark:shadow-[0_1px_2px_rgba(0,0,0,0.25)] break-words"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },

          // Pre element for code blocks
          pre({ children, ...props }) {
            return <CodeBlockWrapper>{children}</CodeBlockWrapper>;
          },

          // Headings with modern typography
          h1({ children }) {
            return (
              <h1 className="mt-8 mb-4 text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
                {children}
              </h1>
            );
          },
          h2({ children }) {
            return (
              <h2 className="mt-7 mb-3.5 flex items-center gap-2 border-b border-zinc-200/80 pb-2 text-xl font-bold tracking-tight text-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>{children}</span>
              </h2>
            );
          },
          h3({ children }) {
            return (
              <h3 className="mt-6 mb-2.5 text-base sm:text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                {children}
              </h3>
            );
          },
          h4({ children }) {
            return (
              <h4 className="mt-4 mb-2 text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200">
                {children}
              </h4>
            );
          },

          // Paragraphs
          p({ children }) {
            return (
              <p className="my-3 text-[14.5px] leading-relaxed text-zinc-700 dark:text-zinc-300">
                {children}
              </p>
            );
          },

          // Lists
          ul({ children }) {
            return (
              <ul className="my-3 list-disc list-outside space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-zinc-700 marker:text-blue-500 dark:text-zinc-300">
                {children}
              </ul>
            );
          },
          ol({ children }) {
            return (
              <ol className="my-3 list-decimal list-outside space-y-1.5 pl-5 text-[14.5px] leading-relaxed text-zinc-700 marker:font-semibold marker:text-blue-500 dark:text-zinc-300">
                {children}
              </ol>
            );
          },
          li({ children }) {
            return <li className="leading-relaxed">{children}</li>;
          },

          // Blockquotes
          blockquote({ children }) {
            return (
              <blockquote className="my-4 rounded-r-xl border-l-4 border-blue-500 bg-blue-50/60 px-4 py-3 text-sm italic text-zinc-700 dark:bg-blue-950/25 dark:text-zinc-300">
                {children}
              </blockquote>
            );
          },

          // Tables
          table({ children }) {
            return (
              <div className="my-4 overflow-x-auto rounded-xl border border-zinc-200 shadow-xs dark:border-zinc-800">
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  {children}
                </table>
              </div>
            );
          },
          thead({ children }) {
            return (
              <thead className="border-b border-zinc-200 bg-zinc-100/80 font-semibold text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100">
                {children}
              </thead>
            );
          },
          th({ children }) {
            return (
              <th className="px-4 py-2.5 text-xs font-bold uppercase tracking-wider">
                {children}
              </th>
            );
          },
          td({ children }) {
            return (
              <td className="border-b border-zinc-100 px-4 py-2.5 text-zinc-700 dark:border-zinc-800/60 dark:text-zinc-300">
                {children}
              </td>
            );
          },

          // Strong / Bold
          strong({ children }) {
            return (
              <strong className="font-bold text-zinc-900 dark:text-zinc-100">
                {children}
              </strong>
            );
          },

          // Links
          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-blue-600 underline underline-offset-2 hover:text-blue-500 dark:text-blue-400"
              >
                {children}
              </a>
            );
          },

          // Dividers
          hr() {
            return <hr className="my-6 border-zinc-200 dark:border-zinc-800" />;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
