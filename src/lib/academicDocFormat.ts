/** Format Khmer/English academic documents (Word paste, .docx) into readable Markdown. */

const KHMER_DIGIT: Record<string, string> = {
  '០': '0',
  '១': '1',
  '២': '2',
  '៣': '3',
  '៤': '4',
  '៥': '5',
  '៦': '6',
  '៧': '7',
  '៨': '8',
  '៩': '9',
};

const STANDALONE_TITLES = new Set([
  'អារម្ពកថា',
  'abstract',
  'មាតិកា',
  'table of contents',
  'សេចក្ដីសន្និដ្ឋាន',
  'សេចក្តីសន្និដ្ឋាន',
  'អនុសាសន៍',
  'ឯកសារយោង',
  'ឧបសគ្គ',
  'ឧបសម្ពន្ធ',
  'មូលអត្ថន័យសង្ខេប',
  'សេចក្ដីថ្លែងអំណរគុណ',
]);

export function khmerDigitsToAscii(value: string): string {
  return value.replace(/[០-៩]/g, (ch) => KHMER_DIGIT[ch] ?? ch);
}

/** Split run-on sentences: "។ការ" → newline after ។ */
export function splitKhmerSentences(text: string): string[] {
  return text
    .replace(/([។.!?])(?=[\u1780-\u17FFA-Za-z0-9])/g, '$1\n')
    .replace(/([។.!?])\s+(?=[\u1780-\u17FFA-Za-z])/g, '$1\n')
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
}

function splitMultiNumberedLine(line: string): string[] {
  const parts = line.split(/\s{2,}(?=[០-៩\d]+[.．]\s*)/);
  if (parts.length > 1) return parts.map((p) => p.trim()).filter(Boolean);
  return [line];
}

function isStudentListEntry(line: string): boolean {
  const normalized = khmerDigitsToAscii(line.trim());
  if (/\s{2,}[០-៩\d]+[.．]\s/.test(line)) return true;
  const m = normalized.match(/^(\d+)\.\s+(.+)$/);
  if (!m) return false;
  const title = m[2].trim();
  if (title.length > 55) return false;
  if (/^\d+\.\s/.test(title)) return true;
  const words = title.split(/\s+/).filter(Boolean);
  return words.length <= 3 && title.length <= 28;
}

function parseOutlineLine(line: string, allowTopLevel: boolean): { level: number; text: string } | null {
  const normalized = khmerDigitsToAscii(line.trim());
  const m = normalized.match(/^(\d+(?:\.\d+)*)\.\s*(.+)$/);
  if (!m) return null;
  if (isStudentListEntry(line)) return null;
  const segments = m[1].split('.');
  if (!allowTopLevel && segments.length === 1) return null;
  const level = Math.min(4, segments.length + 1);
  const prefix = m[1].replace(/\./g, '.') + '.';
  return { level, text: `${prefix} ${m[2].trim()}` };
}

function isMetaLine(line: string): boolean {
  const t = line.trim();
  if (!t) return true;
  if (/^មុខវិជ្ជា\s*[:：]/i.test(t)) return true;
  if (/^subject\s*[:：]/i.test(t)) return true;
  if (/^ស្រាវជ្រាវដោយ/i.test(t)) return true;
  if (/^សាស្រ្ដាចារ្យ/i.test(t)) return true;
  if (/^professor/i.test(t)) return true;
  if (/^the university of cambodia/i.test(t)) return true;
  if (/^សាកលវិទ្យាល័យ/i.test(t) && t.length < 40) return true;
  if (/^រាជធានី|^phnom penh/i.test(t)) return true;
  if (/^ថ្ងៃទី|^date\s*[:：]/i.test(t)) return true;
  if (/^និស្សិត/i.test(t) && t.length < 80) return true;
  return false;
}

function headingPrefix(level: number): string {
  return '#'.repeat(Math.min(6, Math.max(2, level)));
}

export function shouldSplitAsParagraphBlock(line: string): boolean {
  const t = line.trim();
  if (t.length < 100) return false;
  const endings = (t.match(/[។.!?]/g) || []).length;
  return endings >= 2;
}

/** Main formatter for research papers / lesson imports from Word. */
export function formatAcademicDocument(raw: string): string {
  const lines = (raw || '').replace(/\r\n/g, '\n').split('\n');
  const out: string[] = [];
  let afterAbstractTitle = false;
  let inFrontMatter = true;
  let titleSet = false;

  for (const rawLine of lines) {
    const chunks = splitMultiNumberedLine(rawLine);
    for (const chunk of chunks) {
      const trimmed = chunk.trim();
      if (!trimmed) {
        if (out.length && out[out.length - 1] !== '') out.push('');
        afterAbstractTitle = false;
        continue;
      }

      const lower = trimmed.toLowerCase();
      const titleKey = STANDALONE_TITLES.has(trimmed) || STANDALONE_TITLES.has(lower);
      if (titleKey) {
        if (trimmed === 'អារម្ពកថា' || lower === 'abstract') inFrontMatter = false;
        out.push(`${headingPrefix(2)} ${trimmed}`);
        afterAbstractTitle = trimmed === 'អារម្ពកថា' || lower === 'abstract';
        continue;
      }

      if (inFrontMatter && !titleSet && trimmed.length >= 30 && !isMetaLine(trimmed) && !/^\d/.test(trimmed)) {
        out.push(`# ${trimmed}`);
        titleSet = true;
        continue;
      }

      const outline = parseOutlineLine(trimmed, !inFrontMatter);
      if (outline) {
        out.push(`${headingPrefix(outline.level)} ${outline.text}`);
        afterAbstractTitle = false;
        continue;
      }

      if (isMetaLine(trimmed)) {
        out.push(trimmed);
        continue;
      }

      if (afterAbstractTitle || shouldSplitAsParagraphBlock(trimmed)) {
        const sentences = splitKhmerSentences(trimmed);
        if (sentences.length > 1) {
          for (const sentence of sentences) {
            out.push(sentence);
            out.push('');
          }
          afterAbstractTitle = false;
          continue;
        }
      }

      if (
        !inFrontMatter &&
        trimmed.length <= 90 &&
        !/[។.!?]$/.test(trimmed) &&
        !/^\d/.test(trimmed) &&
        !isMetaLine(trimmed)
      ) {
        out.push(`${headingPrefix(2)} ${trimmed}`);
        afterAbstractTitle = false;
        continue;
      }

      out.push(trimmed);
      afterAbstractTitle = false;
    }
  }

  let md = out.join('\n').replace(/\n{3,}/g, '\n\n').trim();

  // Second pass: any remaining long glue paragraphs
  md = md
    .split('\n\n')
    .map((block) => {
      const single = block.replace(/\n/g, ' ').trim();
      if (shouldSplitAsParagraphBlock(single)) {
        return splitKhmerSentences(single).join('\n\n');
      }
      return block.trim();
    })
    .join('\n\n');

  return md.trim();
}

export function stripHtmlImages(html: string): string {
  return html
    .replace(/<img\b[^>]*>/gi, '')
    .replace(/<a\b[^>]*><\/a>/gi, '');
}
