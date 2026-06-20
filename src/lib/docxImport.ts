import mammoth from 'mammoth';
import { formatAcademicDocument, stripHtmlImages } from './academicDocFormat';
import { markdownToEditorHtml, normalizeImportedMarkdown } from './lessonContent';

export async function convertDocxToEditorHtml(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();

  const textResult = await mammoth.extractRawText({ arrayBuffer: buffer });
  const plain = (textResult.value || '').trim();

  if (plain) {
    const md = formatAcademicDocument(plain);
    return markdownToEditorHtml(normalizeImportedMarkdown(md));
  }

  const htmlResult = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const cleaned = stripHtmlImages(htmlResult.value || '').trim();
  if (!cleaned) return '<p><br></p>';

  const tmp = document.createElement('div');
  tmp.innerHTML = cleaned;
  const fallbackText = tmp.textContent?.replace(/\r\n/g, '\n') || '';
  const md = formatAcademicDocument(fallbackText);
  return markdownToEditorHtml(normalizeImportedMarkdown(md));
}
