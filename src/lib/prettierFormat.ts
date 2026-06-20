import { detectCodeLanguage } from './codeFormat';

const SQL_KEYWORDS = [
  'UNION ALL',
  'LEFT OUTER JOIN',
  'RIGHT OUTER JOIN',
  'INNER JOIN',
  'LEFT JOIN',
  'RIGHT JOIN',
  'OUTER JOIN',
  'GROUP BY',
  'ORDER BY',
  'INSERT INTO',
  'DELETE FROM',
  'CREATE TABLE',
  'ALTER TABLE',
  'UNION',
  'SELECT',
  'FROM',
  'WHERE',
  'JOIN',
  'HAVING',
  'INSERT',
  'UPDATE',
  'VALUES',
  'SET',
  'INTO',
  'LIMIT',
  'OFFSET',
  'EXCEPT',
  'INTERSECT',
  'AND',
  'OR',
  'ON',
];

function prettierParserForLang(lang: string): string | null {
  const l = lang.toLowerCase();
  if (l === 'javascript' || l === 'js') return 'babel';
  if (l === 'typescript' || l === 'ts') return 'typescript';
  if (l === 'json') return 'json';
  if (l === 'html') return 'html';
  if (l === 'css') return 'css';
  return null;
}

export function canFormatLanguage(lang: string): boolean {
  const l = lang.toLowerCase();
  if (prettierParserForLang(l)) return true;
  return ['sql', 'bash', 'shell', 'python', 'text', 'code'].includes(l);
}

function formatSqlBasic(code: string): string {
  let normalized = code.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();
  for (const keyword of SQL_KEYWORDS) {
    const pattern = keyword.replace(/\s+/g, '\\s+');
    normalized = normalized.replace(new RegExp(`\\b${pattern}\\b`, 'gi'), `\n${keyword}`);
  }
  return normalized
    .replace(/^\n+/, '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('\n');
}

function formatBashBasic(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trimEnd())
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function formatPythonBasic(code: string): string {
  return code
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.replace(/\t/g, '    ').trimEnd())
    .join('\n')
    .trim();
}

let prettierLoadPromise: Promise<{
  format: (source: string, options: Record<string, unknown>) => Promise<string>;
  plugins: unknown[];
}> | null = null;

async function loadPrettier() {
  if (!prettierLoadPromise) {
    prettierLoadPromise = Promise.all([
      import('prettier/standalone'),
      import('prettier/plugins/babel'),
      import('prettier/plugins/estree'),
      import('prettier/plugins/typescript'),
      import('prettier/plugins/html'),
      import('prettier/plugins/postcss'),
    ]).then(([prettier, parserBabel, parserEstree, parserTypescript, parserHtml, parserPostcss]) => ({
      format: prettier.default.format,
      plugins: [
        parserBabel.default,
        parserEstree.default,
        parserTypescript.default,
        parserHtml.default,
        parserPostcss.default,
      ],
    }));
  }
  return prettierLoadPromise;
}

async function formatWithPrettier(code: string, parser: string): Promise<string> {
  const { format, plugins } = await loadPrettier();
  return format(code, {
    parser,
    plugins,
    printWidth: 88,
    tabWidth: 2,
    singleQuote: true,
    trailingComma: 'es5',
  });
}

export async function formatSourceCode(code: string, language: string): Promise<string> {
  const trimmed = code.replace(/\r\n/g, '\n');
  if (!trimmed.trim()) return trimmed;

  const lang = language.toLowerCase();
  const parser = prettierParserForLang(lang);

  if (parser) {
    return formatWithPrettier(trimmed, parser);
  }

  if (lang === 'sql') return formatSqlBasic(trimmed);
  if (lang === 'bash' || lang === 'shell') return formatBashBasic(trimmed);
  if (lang === 'python') return formatPythonBasic(trimmed);

  const detected = detectCodeLanguage(trimmed);
  const detectedParser = prettierParserForLang(detected);
  if (detectedParser) {
    return formatWithPrettier(trimmed, detectedParser);
  }

  if (detected === 'sql') return formatSqlBasic(trimmed);
  if (detected === 'bash') return formatBashBasic(trimmed);
  if (detected === 'python') return formatPythonBasic(trimmed);

  throw new Error(`unsupported-language:${lang}`);
}
