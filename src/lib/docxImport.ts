import mammoth from 'mammoth';
import { plainTextToEditorHtml } from './pasteSanitize';

export async function convertDocxToEditorHtml(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const result = await mammoth.convertToHtml({ arrayBuffer: buffer });
  const html = result.value?.trim();
  if (html) return html;
  const text = result.messages.length ? '' : '';
  const fallbackText = await mammoth.extractRawText({ arrayBuffer: buffer });
  return plainTextToEditorHtml(fallbackText.value || text);
}
