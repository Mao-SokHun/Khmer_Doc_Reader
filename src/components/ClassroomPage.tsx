import { useEffect, useMemo, useState } from 'react';
import { BookOpen, CheckCircle2, GraduationCap, Loader2 } from 'lucide-react';
import { Language, translations } from '../i18n';
import { DocViewer } from './DocViewer';
import { ThemeToggle } from './ThemeToggle';
import { getReaderId } from '../lib/auth';
import { getApiBaseUrl, fetchWithRetry } from '../lib/apiBaseUrl';

type ClassroomLesson = {
  id: string;
  folderId: string;
  title: string;
  content: string;
  order: number;
};

type ClassroomPayload = {
  classroom: { token: string; folderId: string; title: string; expiresAt?: string | null };
  lessons: ClassroomLesson[];
};

type ClassroomPageProps = {
  token: string;
  lang: Language;
  fontSize: number;
};

export function ClassroomPage({ token, lang, fontSize }: ClassroomPageProps) {
  const t = translations[lang];
  const [payload, setPayload] = useState<ClassroomPayload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const readerId = useMemo(() => getReaderId(), []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchWithRetry(`${getApiBaseUrl()}/api/classroom/${encodeURIComponent(token)}`)
      .then(async (res) => {
        if (!res.ok) throw new Error(await res.text());
        return res.json() as Promise<ClassroomPayload>;
      })
      .then((data) => {
        if (!cancelled) setPayload(data);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token]);

  const activeLesson = payload?.lessons.find((l) => l.id === activeLessonId) ?? null;

  const markRead = async (lessonId: string) => {
    setReadIds((prev) => new Set(prev).add(lessonId));
    try {
      await fetchWithRetry(`${getApiBaseUrl()}/api/classroom/${encodeURIComponent(token)}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, readerId }),
      });
    } catch {
      /* best effort */
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (error || !payload) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-3 bg-slate-50 px-4 dark:bg-slate-950">
        <p className="text-slate-600 dark:text-slate-400">{t.classroomNotFound}</p>
        <a href="/" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white">
          {t.goToHome}
        </a>
      </div>
    );
  }

  if (activeLesson) {
    return (
      <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveLessonId(null)}
            className="text-sm font-semibold text-blue-600 dark:text-blue-400"
          >
            ← {t.classroomBack}
          </button>
          <span className="truncate font-bold text-slate-800 dark:text-slate-100">{activeLesson.title}</span>
          <ThemeToggle lightLabel={t.lightMode} darkLabel={t.darkMode} />
        </header>
        <main className="flex-1 overflow-y-auto">
          <DocViewer
            content={activeLesson.content}
            fontSize={fontSize}
            readOnly
            shareToken={token}
            lessonId={activeLesson.id}
            readerId={readerId}
          />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <GraduationCap size={18} className="text-blue-500" />
          <span className="font-bold text-slate-800 dark:text-slate-100">{payload.classroom.title || t.classroomTitle}</span>
        </div>
        <ThemeToggle lightLabel={t.lightMode} darkLabel={t.darkMode} />
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto p-4">
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">{t.classroomHint}</p>
        <div className="space-y-2">
          {payload.lessons.map((lesson) => {
            const read = readIds.has(lesson.id);
            return (
              <button
                key={lesson.id}
                type="button"
                onClick={() => {
                  setActiveLessonId(lesson.id);
                  void markRead(lesson.id);
                }}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition-colors hover:border-blue-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-blue-700"
              >
                <span className="flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
                  <BookOpen size={16} className="text-blue-500" />
                  {lesson.title}
                </span>
                {read ? <CheckCircle2 size={16} className="text-green-500" /> : null}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
