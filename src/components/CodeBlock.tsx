import { Download, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  language: string;
  code: string;
}

const CODE_SURFACE = '#f1f5f9';
/** One outer border only; header + body share the same frame (reference layout). */
const HEADER_BG = '#f8fafc';

export function CodeBlock({ language, code }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code block:', error);
      setCopied(false);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = `snippet.${language.toLowerCase() || 'txt'}`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 150);
  };

  return (
    <div
      className="my-4 overflow-hidden rounded-lg border border-slate-200"
      data-export-code-block
      data-export-code-lang={language || 'text'}
    >
      <div
        className="flex items-center justify-between border-b border-slate-200 px-4 py-2.5"
        style={{ background: HEADER_BG }}
      >
        <span className="text-[13px] font-semibold uppercase tracking-wide text-slate-700">{language || 'SQL'}</span>
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800"
            title="Download"
          >
            <Download size={15} />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-md p-1.5 text-slate-500 transition-colors hover:bg-slate-200/60 hover:text-slate-800"
            title={copied ? 'Copied' : 'Copy'}
            aria-label={copied ? 'Copied' : 'Copy'}
          >
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
          </button>
        </div>
      </div>

      <SyntaxHighlighter
        language={language.toLowerCase() || 'text'}
        style={oneLight}
        codeTagProps={{ style: { background: 'transparent' } }}
        customStyle={{
          margin: 0,
          padding: '1rem 1.25rem 1.1rem',
          background: CODE_SURFACE,
          border: 'none',
          borderRadius: 0,
          fontSize: '14px',
          fontFamily:
            '"JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
          lineHeight: 1.65,
          color: '#1e293b',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
