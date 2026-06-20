import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Folder, Lesson, SharedLessonPayload } from './types';
import { getApiBaseUrl, formatApiError, fetchWithRetry } from './lib/apiBaseUrl';
import { PLATFORM_GUIDE_VERSION } from './lib/platformGuide';
import { cn, toKhmerDigits } from './lib/utils';
import { Sidebar } from './components/Sidebar';
import { HomePage } from './components/HomePage';
import { DocViewer } from './components/DocViewer';
import { PdfExportPreview } from './components/PdfExportPreview';
import { Editor } from './components/Editor';
import { translations, Language } from './i18n';
import { GoogleGenAI } from "@google/genai";
import { 
  BookOpen, 
  Edit3, 
  Plus, 
  Layout, 
  Loader2,
  ChevronRight,
  ChevronDown,
  Download,
  Languages,
  Monitor,
  X,
  Check,
  Copy,
  Lock,
  History,
  Search,
  CopyPlus,
  FileDown,
  Presentation,
  MoreHorizontal,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './components/ThemeToggle';
import { GlobalSearchModal } from './components/GlobalSearchModal';
import { PresentationMode } from './components/PresentationMode';
import { TemplatePickerModal } from './components/TemplatePickerModal';
import { NameInputModal } from './components/NameInputModal';
import { ConfirmModal } from './components/ConfirmModal';
import { getOwnerId, getOwnerLabel } from './lib/auth';
import { loadFontSize, saveFontSize } from './lib/preferences';
import type { LessonTemplate } from './lib/templates';
import { getTemplateContent } from './lib/templates';
import type { SearchResult } from './lib/search';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import {
  buildPdfStyleVars,
  getContinuationPageTopPad,
  waitForPreviewExportReady,
} from './lib/pdfExport';
import type { PdfPageSlice } from './lib/pdfPageBreaks';
import {
  mountExportIframeFromPreview,
  measureExportRootPageSlices,
  renderPdfFromPreview,
  unmountExportIframe,
} from './lib/pdfRenderFromPreview';
import { jsPDF } from 'jspdf';

export default function App() {
  type LessonSnapshot = {
    id: string;
    lessonId: string;
    ownerId: string;
    title: string;
    content: string;
    triggerType: string;
    createdAt: string;
  };
  type ExportPageSize = 'a5' | 'a4' | 'a3' | 'a2' | 'letter' | 'legal' | 'tabloid';


  const [isTranslating, setIsTranslating] = useState(false);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [pdfExportReady, setPdfExportReady] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const exportPageOptions: Array<{ key: ExportPageSize; label: string; width: number; height: number }> = [
    { key: 'a5', label: 'A5', width: 559, height: 794 },
    { key: 'a4', label: 'A4', width: 794, height: 1123 },
    { key: 'a3', label: 'A3', width: 1123, height: 1587 },
    { key: 'a2', label: 'A2', width: 1587, height: 2245 },
    { key: 'letter', label: 'Letter', width: 816, height: 1056 },
    { key: 'legal', label: 'Legal', width: 816, height: 1344 },
    { key: 'tabloid', label: 'Tabloid', width: 1056, height: 1632 },
  ];
  const getPageDimensions = (size: ExportPageSize) =>
    exportPageOptions.find((opt) => opt.key === size) || exportPageOptions[1];
  const [exportSettings, setExportSettings] = useState({
    pageSize: 'a4' as ExportPageSize,
    orientation: 'portrait' as 'portrait' | 'landscape',
    margins: 32,
    startPage: 1,
    endPage: 1,
    useCustomRange: false,
  });
  const [totalPages, setTotalPages] = useState(1);
  const [pdfPageSlices, setPdfPageSlices] = useState<PdfPageSlice[]>([
    { offsetY: 0, sliceHeight: 1, topPadPx: 0 },
  ]);
  const [lang, setLang] = useState<Language>('kh');
  const [fontSize, setFontSize] = useState(() => loadFontSize());
  const ownerId = useMemo(() => getOwnerId(), []);
  const ownerLabel = useMemo(() => getOwnerLabel(), [ownerId]);
  const [sharedPayload, setSharedPayload] = useState<SharedLessonPayload | null>(null);
  const [shareLoadError, setShareLoadError] = useState<string | null>(null);
  const [loadingShared, setLoadingShared] = useState(false);
  const [workspaceLoadError, setWorkspaceLoadError] = useState<string | null>(null);
  const [editorContentReloadKey, setEditorContentReloadKey] = useState(0);
  const shareTokenFromUrl = useMemo(
    () => new URLSearchParams(window.location.search).get('share'),
    []
  );
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showPresentation, setShowPresentation] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateFolderId, setTemplateFolderId] = useState<string | null>(null);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareAccess, setShareAccess] = useState<'anyone' | 'restricted'>('anyone');
  const [shareRole, setShareRole] = useState<'viewer' | 'commenter' | 'editor'>('viewer');
  const [translateTarget, setTranslateTarget] = useState('en');
  const [showHeaderMoreMenu, setShowHeaderMoreMenu] = useState(false);
  const [nameModal, setNameModal] = useState<
    | { kind: 'createTab' }
    | { kind: 'renameTab'; folderId: string; currentName: string }
    | { kind: 'createLesson'; folderId: string }
    | null
  >(null);
  const [pendingLessonTitle, setPendingLessonTitle] = useState<string | null>(null);
  const [deleteLessonTarget, setDeleteLessonTarget] = useState<{ id: string; title: string } | null>(null);
  const [lessonSnapshots, setLessonSnapshots] = useState<LessonSnapshot[]>([]);
  const [loadingSnapshots, setLoadingSnapshots] = useState(false);
  const [restoringSnapshotId, setRestoringSnapshotId] = useState<string | null>(null);
  const [navigateToText, setNavigateToText] = useState<string | null>(null);
  const [navigateToHeadingId, setNavigateToHeadingId] = useState<string | null>(null);
  const [navigateToSeq, setNavigateToSeq] = useState(0);
  const [sidebarWidth, setSidebarWidth] = useState(320);
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarResizeRafRef = useRef<number | null>(null);
  const pendingSidebarWidthRef = useRef(320);
  const headerMoreMenuRef = useRef<HTMLDivElement | null>(null);

  const t = translations[lang];
  const apiBaseUrl = useMemo(() => getApiBaseUrl(), []);

  const apiFetch = async <T,>(path: string, init?: RequestInit): Promise<T> => {
    const response = await fetchWithRetry(`${apiBaseUrl}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(init?.headers || {}),
      },
      ...init,
    });
    if (!response.ok) {
      const msg = await response.text();
      throw new Error(formatApiError(msg || `API error ${response.status}`, lang));
    }
    if (response.status === 204) return null as T;
    return response.json() as Promise<T>;
  };

  const seedPlatformGuide = async (ownerId: string, currentLang: Language): Promise<string> => {
    const tr = translations[currentLang];
    const guideFolder = await apiFetch<Folder>('/api/folders', {
      method: 'POST',
      body: JSON.stringify({
        ownerId,
        name: tr.guideFolder,
        order: 0,
      }),
    });
    const guideLesson = await apiFetch<Lesson>('/api/lessons', {
      method: 'POST',
      body: JSON.stringify({
        ownerId,
        folderId: guideFolder.id,
        title: tr.guideTitle,
        content: tr.guideContent,
        order: 0,
      }),
    });
    return guideLesson.id;
  };

  const loadWorkspace = async (ownerId: string, currentLang: Language) => {
    const versionKey = 'khmer-doc-guide-version';
    let guideLessonId: string | null = null;

    const [folderList, lessonList] = await Promise.all([
      apiFetch<Folder[]>(`/api/folders?ownerId=${encodeURIComponent(ownerId)}`),
      apiFetch<Lesson[]>(`/api/lessons?ownerId=${encodeURIComponent(ownerId)}`),
    ]);

    let nextLessons = lessonList;

    if (localStorage.getItem(versionKey) !== PLATFORM_GUIDE_VERSION) {
      const tr = translations[currentLang];
      const guideFolder = folderList.find((f) => f.name === tr.guideFolder);
      const guideLesson = guideFolder
        ? lessonList.find((l) => l.folderId === guideFolder.id)
        : undefined;

      if (guideLesson) {
        const updated = await apiFetch<Lesson>(`/api/lessons/${guideLesson.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            title: tr.guideTitle,
            content: tr.guideContent,
          }),
        });
        nextLessons = lessonList.map((l) => (l.id === updated.id ? updated : l));
      } else if (folderList.length === 0) {
        guideLessonId = await seedPlatformGuide(ownerId, currentLang);
        await loadWorkspace(ownerId, currentLang);
        return;
      } else {
        guideLessonId = await seedPlatformGuide(ownerId, currentLang);
        await loadWorkspace(ownerId, currentLang);
        return;
      }

      localStorage.setItem(versionKey, PLATFORM_GUIDE_VERSION);
    }

    setFolders(folderList);
    setLessons(nextLessons);

    if (folderList.length === 0) {
      await seedPlatformGuide(ownerId, currentLang);
      await loadWorkspace(ownerId, currentLang);
      return;
    }

    if (guideLessonId) {
      setActiveLessonId(guideLessonId);
    }
  };

  useEffect(() => {
    if (!isResizingSidebar) return;
    const handleMouseMove = (e: MouseEvent) => {
      const minWidth = 240;
      const maxWidth = 520;
      pendingSidebarWidthRef.current = Math.max(minWidth, Math.min(maxWidth, e.clientX));
      if (sidebarResizeRafRef.current !== null) return;
      sidebarResizeRafRef.current = requestAnimationFrame(() => {
        setSidebarWidth(pendingSidebarWidthRef.current);
        sidebarResizeRafRef.current = null;
      });
    };
    const handleMouseUp = () => {
      setIsResizingSidebar(false);
      if (sidebarResizeRafRef.current !== null) {
        cancelAnimationFrame(sidebarResizeRafRef.current);
        sidebarResizeRafRef.current = null;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      if (sidebarResizeRafRef.current !== null) {
        cancelAnimationFrame(sidebarResizeRafRef.current);
        sidebarResizeRafRef.current = null;
      }
    };
  }, [isResizingSidebar]);

  useEffect(() => {
    if (!shareTokenFromUrl) return;
    let cancelled = false;
    setLoadingShared(true);
    apiFetch<SharedLessonPayload>(`/api/share/${encodeURIComponent(shareTokenFromUrl)}`)
      .then((payload) => {
        if (!cancelled) setSharedPayload(payload);
      })
      .catch((e) => {
        if (!cancelled) setShareLoadError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoadingShared(false);
      });
    return () => {
      cancelled = true;
    };
  }, [shareTokenFromUrl]);

  useEffect(() => {
    if (sharedPayload || isEditing) return;
    let cancelled = false;
    const run = async () => {
      try {
        await loadWorkspace(ownerId, lang);
        if (!cancelled) setWorkspaceLoadError(null);
      } catch (e) {
        if (!cancelled) {
          console.error('Load workspace failed:', e);
          setWorkspaceLoadError(e instanceof Error ? e.message : String(e));
        }
      }
    };
    run();
    const interval = window.setInterval(run, 4000);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [lang, ownerId, sharedPayload, isEditing]);

  useEffect(() => {
    if (!showShareModal || !activeLessonId) {
      setShareToken(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const result = await apiFetch<{ token: string }>(`/api/lessons/${activeLessonId}/share`, {
          method: 'POST',
          body: JSON.stringify({ ownerId, role: shareRole, access: shareAccess }),
        });
        if (!cancelled) setShareToken(result.token);
      } catch (e) {
        console.error('Create share link failed:', e);
        if (!cancelled) setShareToken(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [showShareModal, activeLessonId, shareRole, shareAccess, ownerId]);

  const activeLesson = lessons.find(l => l.id === activeLessonId);
  const pdfPreviewContainerRef = useRef<HTMLDivElement>(null);

  const exportPrintWidth = useMemo(() => {
    const dims = getPageDimensions(exportSettings.pageSize);
    return exportSettings.orientation === 'portrait' ? dims.width : dims.height;
  }, [exportSettings.pageSize, exportSettings.orientation]);

  const exportPdfStyleVars = useMemo(
    () => buildPdfStyleVars(fontSize, exportPrintWidth, exportSettings.margins),
    [fontSize, exportPrintWidth, exportSettings.margins]
  );

  useEffect(() => {
    if (!showExportModal || !activeLesson) {
      setPdfExportReady(false);
      return;
    }

    let cancelled = false;
    setPdfExportReady(false);

    const calculatePages = async () => {
      let mount: Awaited<ReturnType<typeof mountExportIframeFromPreview>> | null = null;
      try {
        await new Promise((r) => setTimeout(r, 120));
        if (cancelled) return;

        const wrapper = await waitForPreviewExportReady(pdfPreviewContainerRef.current);
        if (cancelled) return;

        const dims = getPageDimensions(exportSettings.pageSize);
        const pdfPageWidth =
          exportSettings.orientation === 'portrait' ? dims.width : dims.height;
        const pdfPageHeight =
          exportSettings.orientation === 'portrait' ? dims.height : dims.width;

        mount = await mountExportIframeFromPreview({
          previewRoot: wrapper,
          styleVars: exportPdfStyleVars,
          lessonTitle: activeLesson.title,
          printWidth: exportPrintWidth,
        });
        if (cancelled) return;

        const pageSlices = measureExportRootPageSlices(
          mount.exportRoot,
          pdfPageWidth,
          pdfPageHeight,
          getContinuationPageTopPad(exportPdfStyleVars)
        );
        const estimatedPages = pageSlices.length;

        if (!cancelled) {
          setPdfPageSlices(pageSlices);
          setTotalPages(estimatedPages);
          setPdfExportReady(true);
          setExportSettings((s) => {
            const shouldUpdateEnd =
              !s.useCustomRange || s.endPage > estimatedPages || s.endPage === totalPages;
            return {
              ...s,
              endPage: shouldUpdateEnd ? estimatedPages : s.endPage,
            };
          });
        }
      } catch {
        if (!cancelled) {
          setPdfPageSlices([{ offsetY: 0, sliceHeight: 1, topPadPx: 0 }]);
          setTotalPages(1);
        }
      } finally {
        if (mount) unmountExportIframe(mount.iframe);
      }
    };

    calculatePages();
    return () => {
      cancelled = true;
    };
  }, [
    showExportModal,
    activeLesson?.id,
    activeLesson?.content,
    exportSettings.pageSize,
    exportSettings.orientation,
    exportSettings.margins,
    exportPrintWidth,
    exportPdfStyleVars,
    fontSize,
    lang,
  ]);

  const localizeSeedLabel = (value: string) => {
    if (!value) return value;
    const normalize = (text: string) =>
      text
        .toLowerCase()
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/[^\p{L}\p{N}\s]/gu, ' ')
        .replace(/\s+/g, ' ')
        .trim();

    const pairs: Array<[string, string, string[]?]> = [
      [translations.kh.guideFolder, translations.en.guideFolder],
      [translations.kh.guideTitle, translations.en.guideTitle],
      ['មគ្គុទ្ទេសក៍', 'Guide'],
      ['មគ្គុទ្ទេសក៍ប្រើប្រាស់', 'Platform User Guide', ['platform user guide', 'guide']],
    ];
    const normalizedValue = normalize(value);
    for (const [khValue, enValue, aliases = []] of pairs) {
      const khNorm = normalize(khValue);
      const enNorm = normalize(enValue);
      const aliasMatch = aliases.some((alias) => normalizedValue.includes(normalize(alias)));
      const equalMatch = normalizedValue === khNorm || normalizedValue === enNorm;
      const looseMatch =
        (khNorm && normalizedValue.includes(khNorm)) ||
        (enNorm && normalizedValue.includes(enNorm)) ||
        aliasMatch;
      if (equalMatch || looseMatch) return lang === 'kh' ? khValue : enValue;
    }
    return value;
  };
  const uiFolders = folders.map((folder) => ({ ...folder, name: localizeSeedLabel(folder.name) }));
  const uiLessons = lessons.map((lesson) => ({ ...lesson, title: localizeSeedLabel(lesson.title) }));
  const translateLanguageOptions = [
    { code: 'en', label: 'English' },
    { code: 'kh', label: 'Khmer' },
    { code: 'vi', label: 'Vietnamese' },
    { code: 'zh', label: 'Chinese' },
    { code: 'ja', label: 'Japanese' },
    { code: 'ko', label: 'Korean' },
    { code: 'fr', label: 'French' },
  ];

  const loadLessonSnapshots = async () => {
    if (!activeLessonId) {
      setLessonSnapshots([]);
      return;
    }
    setLoadingSnapshots(true);
    try {
      const rows = await apiFetch<LessonSnapshot[]>(
        `/api/lessons/${activeLessonId}/snapshots?ownerId=${encodeURIComponent(ownerId)}&limit=40`
      );
      setLessonSnapshots(rows);
    } catch (e) {
      console.error('Load snapshots failed:', e);
      setLessonSnapshots([]);
    } finally {
      setLoadingSnapshots(false);
    }
  };

  const restoreSnapshot = async (snapshotId: string) => {
    if (!activeLessonId) return;
    setRestoringSnapshotId(snapshotId);
    try {
      const restored = await apiFetch<Lesson>(`/api/lessons/${activeLessonId}/restore/${snapshotId}`, {
        method: 'POST',
        body: JSON.stringify({ ownerId: ownerId }),
      });
      setLessons((prev) => prev.map((lesson) => (lesson.id === restored.id ? restored : lesson)));
      setEditorContentReloadKey((k) => k + 1);
      await loadLessonSnapshots();
    } catch (e) {
      console.error('Restore snapshot failed:', e);
    } finally {
      setRestoringSnapshotId(null);
    }
  };
  const handleSelectLesson = (id: string, focusText?: string, headingId?: string) => {
    setActiveLessonId(id);
    if (headingId) {
      setIsEditing(false);
      setActiveHeadingId(headingId);
      setNavigateToHeadingId(headingId);
      setNavigateToText(focusText?.trim() || null);
      setNavigateToSeq((s) => s + 1);
      return;
    }
    if (focusText?.trim()) {
      setNavigateToHeadingId(null);
      setNavigateToText(focusText.trim());
      setNavigateToSeq((s) => s + 1);
      return;
    }
    setNavigateToHeadingId(null);
    setNavigateToText(null);
  };

  const handleDownloadPDF = async (settings: typeof exportSettings) => {
    if (!activeLesson) return;
    setIsExporting(true);
    
    try {
      const previewRoot = await waitForPreviewExportReady(pdfPreviewContainerRef.current);
      const selectedDims = getPageDimensions(settings.pageSize);
      const printWidth =
        settings.orientation === 'portrait' ? selectedDims.width : selectedDims.height;

      const pdf = new jsPDF({
        orientation: settings.orientation as any,
        unit: 'px',
        format: settings.pageSize,
      });

      const start = settings.useCustomRange ? Math.max(1, settings.startPage) : 1;
      const end = settings.useCustomRange ? settings.endPage : Number.MAX_SAFE_INTEGER;

      await renderPdfFromPreview({
        previewRoot,
        pdf,
        lang,
        styleVars: exportPdfStyleVars,
        lessonTitle: activeLesson.title,
        printWidth,
        startPage: start,
        endPage: end,
        pageSize: settings.pageSize,
        orientation: settings.orientation,
      });

      const safeTitle = (activeLesson.title || 'lesson')
        .replace(/[/\\?%*:|"<>]/g, '-')
        .replace(/[&]/g, 'and')
        .replace(/\s+/g, ' ')
        .trim() || 'lesson';

      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.style.display = 'none';
      link.href = blobUrl;
      link.download = `${safeTitle}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }, 150);

      setShowExportModal(false);
    } catch (error) {
      console.error('PDF Export failed:', error);
      const detail = error instanceof Error ? error.message : String(error);
      const errorMsg =
        lang === 'kh'
          ? `បរាជ័យក្នុងការទាញយក PDF។ សូមព្យាយាមម្ដងទៀត។\n(${detail})`
          : `Failed to download PDF. Please try again.\n(${detail})`;
      alert(errorMsg);
    } finally {
      setIsExporting(false);
    }
  };



  const addFolder = () => {
    setNameModal({ kind: 'createTab' });
  };

  const requestRenameFolder = (folderId: string, currentName: string) => {
    setNameModal({ kind: 'renameTab', folderId, currentName });
  };

  const handleNameModalConfirm = async (name: string) => {
    if (!nameModal) return;
    if (nameModal.kind === 'createTab') {
      try {
        const newFolder = await apiFetch<Folder>('/api/folders', {
          method: 'POST',
          body: JSON.stringify({
            name,
            ownerId: ownerId,
            order: folders.length,
          }),
        });
        setFolders((prev) => [...prev, newFolder].sort((a, b) => a.order - b.order));
      } catch (e) {
        console.error(e);
        alert(t.errorCreatingTab);
      }
    } else if (nameModal.kind === 'createLesson') {
      setPendingLessonTitle(name);
      setTemplateFolderId(nameModal.folderId);
      setShowTemplateModal(true);
    } else if (name !== nameModal.currentName) {
      await updateFolder(nameModal.folderId, name);
    }
    setNameModal(null);
  };

  const handleReorderLessons = async (lessonIds: string[], folderId: string) => {
    try {
      await apiFetch<{ ok: boolean }>('/api/lessons/reorder', {
        method: 'POST',
        body: JSON.stringify({
          ownerId: ownerId,
          folderId,
          lessonIds,
        }),
      });
      setLessons((prev) =>
        prev.map((lesson) => {
          const idx = lessonIds.indexOf(lesson.id);
          if (lesson.folderId === folderId && idx >= 0) return { ...lesson, order: idx };
          return lesson;
        })
      );
    } catch (e) {
      console.error("Reorder error:", e);
    }
  };

  const saveLesson = async (title: string, content: string, isAuto = false) => {
    if (!activeLessonId) return;
    try {
      await apiFetch<Lesson>(`/api/lessons/${activeLessonId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title,
          content,
          createSnapshot: true,
          triggerType: isAuto ? 'autosave' : 'manual',
        }),
      });
      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === activeLessonId ? { ...lesson, title, content } : lesson))
      );
      if (!isAuto) setIsEditing(false);
      if (showHistoryModal) {
        await loadLessonSnapshots();
      }
    } catch (e) {
      console.error(e);
      if (!isAuto) alert(t.errorSavingLesson);
    }
  };

  const handleTranslateContent = async (targetCode?: string) => {
    if (!activeLesson || isTranslating) return;
    setIsTranslating(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const resolvedCode = targetCode || translateTarget;
      const languageByCode: Record<string, string> = {
        en: 'English',
        kh: 'Khmer',
        vi: 'Vietnamese',
        zh: 'Chinese',
        ja: 'Japanese',
        ko: 'Korean',
        fr: 'French',
      };
      const targetLang = languageByCode[resolvedCode] || 'English';
      
      const prompt = `Translate this Markdown document to ${targetLang}.
Keep Markdown structure, headings, lists, code fences, tables, and inline code exactly.
Translate only human-readable text.
Return ONLY the translated Markdown content, no explanations.

${activeLesson.content}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          systemInstruction: "You are a professional translator specialized in technical documentation and Markdown.",
          temperature: 0.2,
        }
      });

      const translatedText = (response.text || '').trim();
      if (!translatedText) throw new Error('No translated text returned');

      await apiFetch<Lesson>(`/api/lessons/${activeLesson.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          content: translatedText,
        }),
      });
      setLessons((prev) =>
        prev.map((lesson) => (lesson.id === activeLesson.id ? { ...lesson, content: translatedText } : lesson))
      );
    } catch (e) {
      console.error("Translation failed:", e);
      alert(lang === 'kh' ? 'បកប្រែបរាជ័យ។ សូមសាកជាថ្មី ឬប្ដូរភាសាគោលដៅ។' : 'Failed to translate content. Try again or change target language.');
    } finally {
      setIsTranslating(false);
    }
  };

  const deleteFolder = async (id: string) => {
    if (!confirm(t.deleteTabConfirm)) return;
    try {
      await apiFetch<null>(`/api/folders/${id}`, { method: 'DELETE' });
      setFolders((prev) => prev.filter((folder) => folder.id !== id));
      setLessons((prev) => prev.filter((lesson) => lesson.folderId !== id));
    } catch (e) {
      console.error(e);
    }
  };

  const updateFolder = async (id: string, name: string) => {
    try {
      const next = await apiFetch<Folder>(`/api/folders/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name }),
      });
      setFolders((prev) => prev.map((folder) => (folder.id === id ? next : folder)));
    } catch (e) {
      console.error(e);
    }
  };

  const requestDeleteLesson = (id: string) => {
    const lesson = lessons.find((l) => l.id === id);
    if (!lesson) return;
    setDeleteLessonTarget({ id, title: lesson.title });
  };

  const deleteLesson = async (id: string) => {
    try {
      await apiFetch<null>(`/api/lessons/${id}`, { method: 'DELETE' });
      setLessons((prev) => prev.filter((lesson) => lesson.id !== id));
      if (activeLessonId === id) {
        setActiveLessonId(null);
        setIsEditing(false);
      }
      setDeleteLessonTarget(null);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleFavorite = async (lessonId: string) => {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    try {
      const updated = await apiFetch<Lesson>(`/api/lessons/${lessonId}/meta`, {
        method: 'PATCH',
        body: JSON.stringify({ ownerId, isFavorite: !lesson.isFavorite }),
      });
      setLessons((prev) => prev.map((l) => (l.id === lessonId ? updated : l)));
    } catch (e) {
      console.error(e);
    }
  };

  const duplicateActiveLesson = async () => {
    if (!activeLessonId) return;
    try {
      const dup = await apiFetch<Lesson>(`/api/lessons/${activeLessonId}/duplicate`, {
        method: 'POST',
        body: JSON.stringify({ ownerId }),
      });
      setLessons((prev) => [...prev, dup].sort((a, b) => a.order - b.order));
      setActiveLessonId(dup.id);
      setIsEditing(false);
    } catch (e) {
      console.error(e);
      alert(lang === 'kh' ? 'បរាជ័យក្នុងការចម្លងមេរៀន' : 'Failed to duplicate lesson');
    }
  };

  const exportMarkdown = () => {
    if (!activeLesson) return;
    const safeTitle =
      (activeLesson.title || 'lesson').replace(/[/\\?%*:|"<>]/g, '-').trim() || 'lesson';
    const blob = new Blob([activeLesson.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${safeTitle}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const promptAddLesson = (folderId: string) => {
    setNameModal({ kind: 'createLesson', folderId });
  };

  const createLessonFromTemplate = async (template: LessonTemplate) => {
    if (!templateFolderId) return;
    const folderId = templateFolderId;
    const title = pendingLessonTitle || (lang === 'kh' ? template.titleKh : template.titleEn);
    setTemplateFolderId(null);
    setPendingLessonTitle(null);
    try {
      const newLesson = await apiFetch<Lesson>('/api/lessons', {
        method: 'POST',
        body: JSON.stringify({
          folderId,
          title,
          content: getTemplateContent(template, lang),
          ownerId,
          order: lessons.filter((l) => l.folderId === folderId).length,
        }),
      });
      setLessons((prev) => [...prev, newLesson].sort((a, b) => a.order - b.order));
      setActiveLessonId(newLesson.id);
      setIsEditing(true);
    } catch (e) {
      console.error(e);
      alert(t.errorCreatingLesson);
    }
  };

  const handleSearchSelect = (result: SearchResult) => {
    setIsEditing(false);
    if (result.headingId) {
      handleSelectLesson(result.lessonId, result.snippet, result.headingId);
      return;
    }
    handleSelectLesson(
      result.lessonId,
      result.matchType === 'content' ? result.snippet.replace(/^…|…$/g, '').trim() : undefined
    );
  };

  const goHome = useCallback(() => {
    setActiveLessonId(null);
    setIsEditing(false);
    setActiveHeadingId(null);
    setNavigateToText(null);
    setNavigateToHeadingId(null);
  }, []);

  const shareLink = shareToken
    ? `${window.location.origin}${window.location.pathname}?share=${shareToken}`
    : '';

  const keyboardShortcuts = useMemo(
    () => ({
      'ctrl+k': () => setShowSearchModal(true),
      ...(activeLesson && !isEditing
        ? {
            'ctrl+e': () => setIsEditing(true),
            'ctrl+p': () => setShowPresentation(true),
            escape: () => goHome(),
          }
        : {}),
    }),
    [activeLesson, isEditing, goHome]
  );
  useKeyboardShortcuts(!sharedPayload, keyboardShortcuts);

  useEffect(() => {
    saveFontSize(fontSize);
  }, [fontSize]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    const onMouseDown = (e: MouseEvent) => {
      if (!headerMoreMenuRef.current) return;
      if (!headerMoreMenuRef.current.contains(e.target as Node)) {
        setShowHeaderMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, []);

  useEffect(() => {
    if (!showHistoryModal) return;
    loadLessonSnapshots();
  }, [showHistoryModal, activeLessonId]);

  if (loadingShared) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fa] dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (shareTokenFromUrl && shareLoadError && !sharedPayload) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f8f9fa] px-6 dark:bg-slate-950">
        <BookOpen size={32} className="text-red-500" />
        <p className="max-w-md text-center text-red-600 dark:text-red-400">
          {lang === 'kh' ? 'មិនអាចបើកតំណចែករំលែកបានទេ។' : 'Could not open this share link.'}
        </p>
        <p className="max-w-md text-center text-sm text-slate-500">{shareLoadError}</p>
        <a
          href="/"
          className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {lang === 'kh' ? 'ទៅទំព័រដើម' : 'Go to home'}
        </a>
      </div>
    );
  }

  if (sharedPayload) {
    const sharedLesson = sharedPayload.lesson;
    return (
      <div className="flex h-screen w-full flex-col bg-[#f8f9fa] dark:bg-slate-950 font-sans overflow-hidden">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 lg:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <BookOpen size={16} className="text-blue-500" />
            <span className="truncate font-bold text-slate-800 dark:text-slate-100">{sharedLesson.title}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {lang === 'kh' ? 'មើលប៉ុណ្ណោះ' : 'View only'}
            </span>
          </div>
          <ThemeToggle lightLabel={t.lightMode} darkLabel={t.darkMode} />
        </header>
        <main className="flex-1 overflow-y-auto">
          <DocViewer content={sharedLesson.content} fontSize={fontSize} readOnly />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-[#f8f9fa] dark:bg-slate-950 font-sans overflow-hidden transition-colors">
      <div className="relative h-full shrink-0" style={{ width: `${sidebarWidth}px` }}>
        <Sidebar
          folders={uiFolders}
          lessons={uiLessons}
          activeLessonId={activeLessonId}
          activeHeadingId={activeHeadingId}
          showFavoritesOnly={showFavoritesOnly}
          onSelectLesson={handleSelectLesson}
          onAddFolder={addFolder}
          onAddLesson={promptAddLesson}
          onDeleteFolder={deleteFolder}
          onUpdateFolder={updateFolder}
          onRenameFolder={requestRenameFolder}
          onDeleteLesson={requestDeleteLesson}
          onReorderLessons={handleReorderLessons}
          onToggleFavorite={toggleFavorite}
          onToggleFavoritesOnly={() => setShowFavoritesOnly((v) => !v)}
          t={t}
        />
        <div
          role="separator"
          aria-orientation="vertical"
          onMouseDown={() => setIsResizingSidebar(true)}
          className={cn(
            "absolute top-0 right-0 h-full w-1.5 cursor-col-resize bg-transparent hover:bg-blue-200/60 transition-colors",
            isResizingSidebar && "bg-blue-300/70"
          )}
          title={lang === 'kh' ? 'ទាញដើម្បីប្ដូរទំហំ Sidebar' : 'Drag to resize sidebar'}
        />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 lg:px-5 z-10 transition-colors">
          <div className="min-w-0 flex-1 overflow-hidden pr-2">
            {activeLesson ? (
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={goHome}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-base font-semibold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  title={t.backToHome}
                >
                  <Layout size={18} className="text-blue-500" />
                  <span className="hidden sm:inline">{t.home}</span>
                </button>
                <div className="flex min-w-0 items-center gap-1.5 text-base text-slate-500 dark:text-slate-400">
                  <span className="hidden md:inline truncate max-w-[100px] lg:max-w-[140px]">
                    {uiFolders.find((f) => f.id === activeLesson.folderId)?.name}
                  </span>
                  <ChevronRight size={12} className="hidden md:inline shrink-0 opacity-50" />
                  <span className="truncate font-semibold text-slate-800 dark:text-slate-100">
                    {localizeSeedLabel(activeLesson.title)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2 text-base font-semibold text-slate-700 dark:text-slate-200">
                <Layout size={18} className="shrink-0 text-blue-500" />
                <span className="truncate">{t.home}</span>
              </div>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={() => setShowSearchModal(true)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={`${t.search} (Ctrl+K)`}
            >
              <Search size={20} />
            </button>

            <ThemeToggle lightLabel={t.lightMode} darkLabel={t.darkMode} />

            <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
              <button
                type="button"
                onClick={() => setLang('kh')}
                className={cn(
                  'min-w-[2.5rem] px-2.5 py-1.5 text-sm font-bold rounded-md transition-all',
                  lang === 'kh'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                KH
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={cn(
                  'min-w-[2.5rem] px-2.5 py-1.5 text-sm font-bold rounded-md transition-all',
                  lang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-sm'
                    : 'text-slate-500 dark:text-slate-400'
                )}
              >
                EN
              </button>
            </div>

            {activeLesson && !isEditing && (
              <>
                <div className="mx-0.5 hidden sm:block h-5 w-px bg-slate-200 dark:bg-slate-700" />

                <button
                  type="button"
                  onClick={() => setShowExportModal(true)}
                  disabled={isExporting}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                  title={t.downloadPdf}
                >
                  {isExporting ? (
                    <Loader2 size={20} className="animate-spin text-blue-500" />
                  ) : (
                    <Download size={20} className="text-red-500" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="inline-flex h-10 items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
                  title={t.edit}
                >
                  <Edit3 size={16} />
                  <span className="hidden sm:inline">{t.edit}</span>
                </button>

                <div ref={headerMoreMenuRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setShowHeaderMoreMenu((s) => !s)}
                    className={cn(
                      'inline-flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors',
                      showHeaderMoreMenu && 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                    )}
                    title={lang === 'kh' ? 'ផ្សេងទៀត' : 'More'}
                  >
                    <MoreHorizontal size={20} />
                  </button>
                  {showHeaderMoreMenu && (
                    <div className="absolute right-0 top-full mt-1 w-56 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1 shadow-xl z-40">
                      <p className="px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {lang === 'kh' ? 'ផ្សេងទៀត' : 'More actions'}
                      </p>
                      <button
                        type="button"
                        disabled={isTranslating}
                        onClick={() => {
                          setShowPresentation(true);
                          setShowHeaderMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50"
                      >
                        <Presentation size={16} className="text-indigo-500" />
                        {t.presentation}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          exportMarkdown();
                          setShowHeaderMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <FileDown size={16} className="text-emerald-500" />
                        {t.exportMarkdown}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          duplicateActiveLesson();
                          setShowHeaderMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                      >
                        <CopyPlus size={16} className="text-violet-500" />
                        {t.duplicate}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (activeLessonId) requestDeleteLesson(activeLessonId);
                          setShowHeaderMoreMenu(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                      >
                        <Trash2 size={16} />
                        {t.delete}
                      </button>
                      <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                      <p className="px-3 py-1 text-xs font-bold uppercase tracking-wide text-slate-400">
                        {t.translate}
                      </p>
                      {translateLanguageOptions.map((option) => (
                        <button
                          key={option.code}
                          type="button"
                          disabled={isTranslating}
                          onClick={async () => {
                            setTranslateTarget(option.code);
                            setShowHeaderMoreMenu(false);
                            await handleTranslateContent(option.code);
                          }}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-50',
                            translateTarget === option.code
                              ? 'font-semibold text-blue-600 dark:text-blue-300'
                              : 'text-slate-700 dark:text-slate-200'
                          )}
                        >
                          {isTranslating && translateTarget === option.code ? (
                            <Loader2 size={12} className="animate-spin" />
                          ) : (
                            <Languages size={12} className="text-blue-500" />
                          )}
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

          </div>
        </header>

        <main className={cn('flex-1 min-h-0', isEditing ? 'overflow-hidden' : 'overflow-y-auto')}>
          {workspaceLoadError ? (
            <div className="border-b border-amber-800/60 bg-amber-950/50 px-4 py-2 text-sm text-amber-200/90 dark:border-amber-900 dark:bg-amber-950/40">
              {lang === 'kh' ? 'មិនអាចផ្ទុកទិន្នន័យបានទេ។' : 'Could not load workspace.'}{' '}
              <span className="opacity-75">{workspaceLoadError}</span>
              <button
                type="button"
                onClick={() => {
                  setWorkspaceLoadError(null);
                  loadWorkspace(ownerId, lang).catch((e) =>
                    setWorkspaceLoadError(e instanceof Error ? e.message : String(e))
                  );
                }}
                className="ml-2 underline opacity-90 hover:opacity-100"
              >
                {lang === 'kh' ? 'ព្យាយាមម្តងទៀត' : 'Retry'}
              </button>
            </div>
          ) : null}
          <AnimatePresence mode="wait">
            {activeLesson ? (
              isEditing ? (
                <div className="h-full min-h-0">
                <Editor
                  lessonId={activeLesson.id}
                  contentReloadKey={editorContentReloadKey}
                  initialTitle={activeLesson.title}
                  initialContent={activeLesson.content}
                  onSave={saveLesson}
                  onExitEditMode={() => setIsEditing(false)}
                  t={t}
                  lang={lang}
                  fontSize={fontSize}
                  onShowShare={() => setShowShareModal(true)}
                  onShowHistory={() => setShowHistoryModal(true)}
                  navigateToText={navigateToText || undefined}
                  navigateToHeadingId={navigateToHeadingId || undefined}
                  navigateToSeq={navigateToSeq}
                />
                </div>
              ) : (
                <motion.div
                  key={activeLesson.id}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                    <DocViewer
                      content={activeLesson.content}
                      fontSize={fontSize}
                      navigateToText={navigateToText || undefined}
                      navigateToHeadingId={navigateToHeadingId || undefined}
                      navigateToSeq={navigateToSeq}
                      onActiveHeadingChange={setActiveHeadingId}
                    />
                </motion.div>
              )
            ) : (
              <HomePage
                lang={lang}
                folders={uiFolders}
                lessons={uiLessons}
                onOpenLesson={setActiveLessonId}
                onEditLesson={(id) => {
                  setActiveLessonId(id);
                  setIsEditing(true);
                }}
                onDeleteLesson={requestDeleteLesson}
                onAddFolder={addFolder}
                onAddLesson={promptAddLesson}
                onSearch={() => setShowSearchModal(true)}
                onTemplates={(folderId) => {
                  setTemplateFolderId(folderId);
                  setShowTemplateModal(true);
                }}
              />
            )}
          </AnimatePresence>
        </main>

        <AnimatePresence>
          {showShareModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-xl text-blue-600">
                        <Lock size={20} />
                      </div>
                      {t.sharing}
                   </h2>
                   <button onClick={() => setShowShareModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                      <X size={20} />
                   </button>
                </div>
                <div className="p-8 space-y-6">
                   <div className="space-y-2">
                      <p className="text-sm font-medium text-slate-500">{lang === 'kh' ? 'តំណភ្ជាប់ទៅកាន់ឯកសារនេះ៖' : 'Link to this document:'}</p>
                      <div className="flex gap-2">
                         <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-600 font-medium truncate">
                           {shareLink || (lang === 'kh' ? 'កំពុងបង្កើតតំណ...' : 'Generating link...')}
                         </div>
                         <button 
                          onClick={async () => {
                            if (!shareLink) return;
                            try {
                              await navigator.clipboard.writeText(shareLink);
                              setLinkCopied(true);
                              window.setTimeout(() => setLinkCopied(false), 2000);
                            } catch (error) {
                              console.error('Failed to copy share link:', error);
                              setLinkCopied(false);
                            }
                           }}
                           className="flex items-center gap-2 bg-blue-600 text-white px-6 rounded-xl font-bold text-sm hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                           disabled={!shareLink}
                         >
                            {linkCopied ? <Check size={18} /> : <Copy size={18} />}
                            {linkCopied ? t.linkCopied : t.copyLink}
                         </button>
                      </div>
                   </div>
                   
                   <div className="pt-4 border-t border-slate-50 grid grid-cols-1 gap-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <label className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
                          <span className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                            {lang === 'kh' ? 'សិទ្ធិចូលមើល' : 'Access'}
                          </span>
                          <div className="relative">
                            <select
                              value={shareAccess}
                              onChange={(e) => setShareAccess(e.target.value as 'anyone' | 'restricted')}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="anyone">{lang === 'kh' ? 'នរណាក៏បានដែលមានតំណ' : 'Anyone with the link'}</option>
                              <option value="restricted">{lang === 'kh' ? 'កំណត់ចំពោះអ្នកអនុញ្ញាត' : 'Restricted'}</option>
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>
                        <label className="rounded-2xl bg-slate-50 border border-slate-100 px-4 py-3 text-sm text-slate-600">
                          <span className="block text-xs font-bold uppercase tracking-wide text-slate-400 mb-2">
                            {lang === 'kh' ? 'តួនាទី' : 'Role'}
                          </span>
                          <div className="relative">
                            <select
                              value={shareRole}
                              onChange={(e) => setShareRole(e.target.value as 'viewer' | 'commenter' | 'editor')}
                              className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:border-slate-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100"
                            >
                              <option value="viewer">{lang === 'kh' ? 'មើលប៉ុណ្ណោះ' : 'Viewer'}</option>
                              <option value="commenter">{lang === 'kh' ? 'មតិយោបល់' : 'Commenter'}</option>
                              <option value="editor">{lang === 'kh' ? 'កែសម្រួល' : 'Editor'}</option>
                            </select>
                            <ChevronDown size={14} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                          </div>
                        </label>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}

          {showHistoryModal && (
            <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                   <h2 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                      <div className="p-2 bg-amber-100 rounded-xl text-amber-600">
                        <History size={20} />
                      </div>
                      {t.versionHistory}
                   </h2>
                   <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
                      <X size={20} />
                   </button>
                </div>
                <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                   <div className="space-y-4">
                      {loadingSnapshots ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          {lang === 'kh' ? 'កំពុងទាញយកប្រវត្តិកំណែ...' : 'Loading version history...'}
                        </div>
                      ) : lessonSnapshots.length === 0 ? (
                        <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
                          {lang === 'kh' ? 'មិនទាន់មាន snapshot ទេ' : 'No snapshots yet'}
                        </div>
                      ) : (
                        lessonSnapshots.map((v, i) => {
                          const isCurrent = i === 0;
                          const isRestoring = restoringSnapshotId === v.id;
                          return (
                            <div key={v.id} className={cn(
                              "p-4 rounded-2xl border transition-all flex justify-between items-center",
                              isCurrent ? "border-blue-200 bg-blue-50 shadow-sm" : "border-slate-100 hover:border-slate-200"
                            )}>
                              <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm", isCurrent ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-400")}>
                                  {ownerLabel.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="text-sm font-bold text-slate-800">{new Date(v.createdAt).toLocaleString()}</p>
                                  <p className="text-xs text-slate-500">{v.triggerType === 'autosave' ? 'Autosave' : v.triggerType === 'restore' ? 'Restore' : 'Manual save'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                {isCurrent ? (
                                  <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">Current</span>
                                ) : (
                                  <button
                                    onClick={() => restoreSnapshot(v.id)}
                                    disabled={!!restoringSnapshotId}
                                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                                  >
                                    {isRestoring ? (lang === 'kh' ? 'កំពុងស្តារ...' : 'Restoring...') : (lang === 'kh' ? 'ស្តារឡើងវិញ' : 'Restore')}
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                   </div>
                   <div className="mt-8 p-4 rounded-2xl bg-amber-50 border border-amber-100 text-amber-800 text-xs text-center font-medium leading-relaxed">
                      {lang === 'kh'
                        ? 'មិនចាំបាច់ចូលគណនី — មេរៀន និងប្រវត្តិកំណែត្រូវបានរក្សាទុកក្នុង Database សម្រាប់ browser នេះ។'
                        : 'No login required — your lessons and version history are saved in the database for this browser.'}
                   </div>
                </div>
              </motion.div>
            </div>
          )}

          {showExportModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
              <motion.div 
                initial={{ opacity: 0, scale: 0.93, y: 24 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.93, y: 24 }}
                transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                className="bg-white rounded-[28px] shadow-2xl w-full max-w-5xl h-[88vh] flex flex-col md:flex-row overflow-hidden relative"
              >
                {/* Left Side: Live Preview */}
                <div className="flex-1 bg-gradient-to-br from-slate-100 to-slate-50 p-6 overflow-y-auto border-r border-slate-100 custom-scrollbar flex flex-col gap-4">
                  {/* Preview header bar */}
                  <div className="flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-4 rounded-full bg-gradient-to-b from-blue-500 to-indigo-500" />
                      <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-500">{t.previewPdf}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[11px] font-bold text-slate-600">{totalPages} {t.totalPages}</span>
                    </div>
                  </div>

                  {/* Paper preview — full scrollable document matching PDF layout */}
                  <div className="flex-1 flex items-start justify-center min-h-0">
                    <div
                      className="relative w-full transition-all duration-300"
                      style={{
                        maxWidth: `${exportPrintWidth}px`,
                      }}
                    >
                      <div className="absolute -bottom-2 left-3 right-3 top-3 bg-slate-200/50 rounded-xl pointer-events-none" />
                      <div
                        ref={pdfPreviewContainerRef}
                        id="pdf-preview-container"
                        className="relative overflow-y-auto custom-scrollbar max-h-[calc(88vh-8rem)] rounded-lg shadow-xl ring-1 ring-slate-200 bg-white"
                      >
                        <PdfExportPreview
                          content={activeLesson?.content || ''}
                          fontSize={fontSize}
                          lang={lang}
                          lessonTitle={activeLesson?.title || ''}
                          styleVars={exportPdfStyleVars}
                          pageBreakOffsets={pdfPageSlices.slice(1).map((slice) => slice.offsetY)}
                          continuationTopPad={getContinuationPageTopPad(exportPdfStyleVars)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Side: Settings */}
                <div className="w-full md:w-[360px] flex flex-col bg-white">
                  <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center">
                    <h2 className="text-base font-bold text-slate-800 flex items-center gap-2.5">
                      <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-lg text-white shadow-sm">
                        <Download size={16} />
                      </div>
                      {t.exportSettings}
                    </h2>
                    <button 
                      onClick={() => setShowExportModal(false)}
                      className="p-1.5 hover:bg-slate-100 rounded-full transition-colors text-slate-400"
                    >
                      <X size={18} />
                    </button>
                  </div>
                  {/* Document summary card */}
                  <div className="mx-5 mt-4 p-3.5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center gap-3">
                    <div className="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center shadow">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-blue-500 mb-0.5">{lang === 'kh' ? 'ឯកសារបច្ចុប្បន្ន' : 'Current document'}</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{activeLesson?.title}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{totalPages} {t.totalPages} &nbsp;·&nbsp; {exportSettings.pageSize.toUpperCase()} {exportSettings.orientation}</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 custom-scrollbar">
                    {/* Page Size */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.pageSize}</label>
                      <div className="grid grid-cols-3 gap-2">
                        {exportPageOptions.map((size) => (
                          <button
                            key={size.key}
                            onClick={() => setExportSettings(s => ({ ...s, pageSize: size.key }))}
                            className={cn(
                              "py-2.5 px-3 rounded-xl border-2 transition-all text-[13px] font-bold",
                              exportSettings.pageSize === size.key
                                ? "border-blue-600 bg-blue-50 text-blue-700" 
                                : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200"
                            )}
                          >
                            {size.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Orientation */}
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.orientation}</label>
                      <div className="grid grid-cols-2 gap-2">
                        {(['portrait', 'landscape'] as const).map((orient) => (
                          <button
                            key={orient}
                            onClick={() => setExportSettings(s => ({ ...s, orientation: orient }))}
                            className={cn(
                              "py-2.5 px-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all text-[13px] font-bold",
                              exportSettings.orientation === orient 
                                ? "border-blue-600 bg-blue-50 text-blue-700" 
                                : "border-slate-100 bg-slate-50/50 text-slate-500 hover:border-slate-200"
                            )}
                          >
                            <Monitor size={16} className={orient === 'landscape' ? 'rotate-90 text-blue-500' : 'text-blue-500'} />
                            {t[orient]}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Margins */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.margins}</label>
                        <span className="text-xs font-bold text-blue-600 font-mono bg-blue-50 px-2 py-0.5 rounded-lg">{exportSettings.margins}px</span>
                      </div>
                      <input 
                        type="range" 
                        min="8" 
                        max="48" 
                        step="2"
                        value={exportSettings.margins}
                        onChange={(e) => setExportSettings(s => ({ ...s, margins: parseInt(e.target.value) }))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>

                    {/* Page Range Selection */}
                    <div className="space-y-4 border-t border-slate-50 pt-8">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">{t.pageRange}</label>
                       <div className="flex gap-2 mb-4">
                          <button 
                            onClick={() => setExportSettings(s => ({ ...s, useCustomRange: false }))}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-xl border-2 text-[12px] font-bold transition-all",
                              !exportSettings.useCustomRange ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                            )}
                          >
                            {t.allPages}
                          </button>
                          <button 
                            onClick={() => setExportSettings(s => ({ ...s, useCustomRange: true }))}
                            className={cn(
                              "flex-1 py-2 px-3 rounded-xl border-2 text-[12px] font-bold transition-all",
                              exportSettings.useCustomRange ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-100 text-slate-400"
                            )}
                          >
                            {t.customRange}
                          </button>
                       </div>

                       {exportSettings.useCustomRange && (
                         <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div className="flex-1 space-y-2">
                               <span className="text-[10px] text-slate-400 font-bold uppercase">{t.startPage}</span>
                               <input 
                                 type="number" 
                                 min="1" 
                                 max={totalPages}
                                 value={exportSettings.startPage}
                                 onChange={(e) => setExportSettings(s => ({ ...s, startPage: parseInt(e.target.value) }))}
                                 className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-700"
                               />
                            </div>
                            <div className="mt-6 font-bold text-slate-300">to</div>
                            <div className="flex-1 space-y-2">
                               <span className="text-[10px] text-slate-400 font-bold uppercase">{t.endPage}</span>
                               <input 
                                 type="number" 
                                 min={exportSettings.startPage} 
                                 max={totalPages}
                                 value={exportSettings.endPage}
                                 onChange={(e) => setExportSettings(s => ({ ...s, endPage: parseInt(e.target.value) }))}
                                 className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:border-blue-600 font-bold text-slate-700"
                               />
                            </div>
                         </div>
                       )}
                    </div>
                  </div>

                  <div className="p-5 bg-gradient-to-b from-slate-50 to-white border-t border-slate-100">
                    <button
                      onClick={() => handleDownloadPDF(exportSettings)}
                      disabled={isExporting || !pdfExportReady}
                      className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2.5 shadow-lg shadow-blue-200/70 dark:shadow-blue-950/50 disabled:opacity-50 active:scale-[0.98]"
                    >
                      {isExporting ? <Loader2 size={18} className="animate-spin" /> : !pdfExportReady ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                      {isExporting
                        ? t.download
                        : !pdfExportReady
                          ? (lang === 'kh' ? 'កំពុងរៀបចំ…' : 'Preparing…')
                          : t.download}
                    </button>
                    <p className="text-center text-[10px] text-slate-400 mt-2.5 font-medium">
                      {lang === 'kh' ? 'ទាញយកជា PDF · ខ្ពស់គុណភាព' : 'Export as high-quality PDF'}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <GlobalSearchModal
          open={showSearchModal}
          onClose={() => setShowSearchModal(false)}
          lessons={lessons}
          lang={lang}
          onSelect={handleSearchSelect}
        />

        <TemplatePickerModal
          open={showTemplateModal}
          onClose={() => {
            setShowTemplateModal(false);
            setTemplateFolderId(null);
            setPendingLessonTitle(null);
          }}
          lang={lang}
          onPick={createLessonFromTemplate}
        />

        <NameInputModal
          open={nameModal !== null}
          title={
            nameModal?.kind === 'renameTab'
              ? t.renameTabTitle
              : nameModal?.kind === 'createLesson'
                ? t.createLessonTitle
                : t.createTabTitle
          }
          label={
            nameModal?.kind === 'createLesson' ? t.enterLessonName : t.enterTabName
          }
          defaultValue={
            nameModal?.kind === 'renameTab'
              ? nameModal.currentName
              : nameModal?.kind === 'createLesson'
                ? t.newLessonTitle
                : lang === 'kh'
                  ? `ផ្ទាំង ${toKhmerDigits(folders.length + 1)}`
                  : `Tab ${folders.length + 1}`
          }
          confirmLabel={t.confirm}
          cancelLabel={t.cancel}
          onConfirm={handleNameModalConfirm}
          onClose={() => setNameModal(null)}
        />

        <ConfirmModal
          open={deleteLessonTarget !== null}
          title={t.deleteLessonTitle}
          message={
            deleteLessonTarget
              ? `${t.deleteLessonMessage}\n\n「${localizeSeedLabel(deleteLessonTarget.title)}」`
              : t.deleteLessonMessage
          }
          confirmLabel={t.delete}
          cancelLabel={t.cancel}
          destructive
          onConfirm={() => deleteLessonTarget && deleteLesson(deleteLessonTarget.id)}
          onClose={() => setDeleteLessonTarget(null)}
        />

        {showPresentation && activeLesson ? (
          <PresentationMode
            content={activeLesson.content}
            title={localizeSeedLabel(activeLesson.title)}
            lang={lang}
            onClose={() => setShowPresentation(false)}
          />
        ) : null}
      </div>
    </div>
  );
}
