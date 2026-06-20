import JSZip from 'jszip';
import { getApiBaseUrl, fetchWithRetry } from './apiBaseUrl';
import type { Folder, Lesson } from '../types';

export type WorkspaceExport = {
  version: number;
  exportedAt: string;
  ownerId: string;
  folders: Folder[];
  lessons: Lesson[];
};

export async function exportWorkspace(ownerId: string): Promise<WorkspaceExport> {
  const response = await fetchWithRetry(
    `${getApiBaseUrl()}/api/workspace/export?ownerId=${encodeURIComponent(ownerId)}`
  );
  if (!response.ok) throw new Error('Export failed');
  return response.json() as Promise<WorkspaceExport>;
}

export async function importWorkspace(
  ownerId: string,
  data: WorkspaceExport,
  mode: 'merge' | 'replace' = 'merge'
) {
  const response = await fetchWithRetry(`${getApiBaseUrl()}/api/workspace/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ownerId, data, mode }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error || 'Import failed');
  }
}

export async function downloadWorkspaceZip(data: WorkspaceExport, filename = 'khmer-lesson-backup') {
  const zip = new JSZip();
  zip.file('workspace.json', JSON.stringify(data, null, 2));
  for (const lesson of data.lessons) {
    const safe = (lesson.title || 'lesson').replace(/[/\\?%*:|"<>]/g, '-').slice(0, 60);
    zip.file(`lessons/${safe}.md`, lesson.content);
  }
  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function parseWorkspaceImportFile(file: File): Promise<WorkspaceExport> {
  if (file.name.endsWith('.zip')) {
    const zip = await JSZip.loadAsync(await file.arrayBuffer());
    const jsonFile = zip.file('workspace.json');
    if (!jsonFile) throw new Error('Invalid backup ZIP — missing workspace.json');
    const text = await jsonFile.async('string');
    return JSON.parse(text) as WorkspaceExport;
  }
  const text = await file.text();
  return JSON.parse(text) as WorkspaceExport;
}
