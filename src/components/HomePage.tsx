import { motion } from 'motion/react';
import {
  BookOpen,
  Edit3,
  FileText,
  FolderOpen,
  Layout,
  Plus,
  Search,
  Sparkles,
  Star,
} from 'lucide-react';
import { Language, translations } from '../i18n';
import { cn } from '../lib/utils';

type HomeFolder = { id: string; name: string };
type HomeLesson = {
  id: string;
  title: string;
  folderId: string;
  isFavorite?: boolean;
  updatedAt?: string;
};

type HomePageProps = {
  lang: Language;
  folders: HomeFolder[];
  lessons: HomeLesson[];
  onOpenLesson: (id: string) => void;
  onEditLesson: (id: string) => void;
  onAddFolder: () => void;
  onAddLesson: (folderId: string) => void;
  onSearch: () => void;
  onTemplates: (folderId: string) => void;
};

export function HomePage({
  lang,
  folders,
  lessons,
  onOpenLesson,
  onEditLesson,
  onAddFolder,
  onAddLesson,
  onSearch,
  onTemplates,
}: HomePageProps) {
  const t = translations[lang];
  const defaultFolderId = folders[0]?.id;

  const features = [
    { icon: Layout, title: t.feature1Title, desc: t.feature1Desc },
    { icon: FileText, title: t.feature2Title, desc: t.feature2Desc },
    { icon: Sparkles, title: t.feature3Title, desc: t.feature3Desc },
  ];

  return (
    <div className="mx-auto max-w-6xl px-5 py-8 lg:px-10 lg:py-10">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-gradient-to-br from-slate-50 via-blue-50/40 to-slate-100 px-6 py-8 dark:border-slate-700/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 lg:px-10 lg:py-10"
      >
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-blue-600/80 dark:text-blue-400/90">
              {t.welcome}
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-200 lg:text-4xl">
              {t.appTitle}
            </h1>
            <p className="mt-3 text-base leading-relaxed text-slate-600 dark:text-slate-400">
              {t.tagline}{' '}
              <span className="font-semibold text-blue-700 dark:text-blue-400">{t.taglineHighlight}</span>
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onSearch}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            >
              <Search size={16} />
              {t.search}
            </button>
            {defaultFolderId ? (
              <button
                type="button"
                onClick={() => onTemplates(defaultFolderId)}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100/80 px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200/80 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Sparkles size={16} />
                {lang === 'kh' ? 'គំរូមេរៀន' : 'Templates'}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onAddFolder}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:bg-blue-500 active:scale-[0.98] dark:shadow-blue-950/40"
            >
              <Plus size={16} />
              {t.createTab}
            </button>
          </div>
        </div>

        <div className="relative z-10 mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:max-w-lg">
          <StatCard label={lang === 'kh' ? 'មេរៀន' : 'Lessons'} value={lessons.length} />
          <StatCard label={lang === 'kh' ? 'ផ្ទាំង' : 'Tabs'} value={folders.length} />
          <StatCard
            label={lang === 'kh' ? 'ពេញចិត្ត' : 'Favorites'}
            value={lessons.filter((l) => l.isFavorite).length}
            className="col-span-2 sm:col-span-1"
          />
        </div>
      </motion.section>

      <section className="mt-10">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">
              {lang === 'kh' ? 'មេរៀនរបស់អ្នក' : 'Your lessons'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-500">
              {lang === 'kh' ? 'ចុចដើម្បីបើក ឬកែសម្រួល' : 'Click to open or edit'}
            </p>
          </div>
          {defaultFolderId ? (
            <button
              type="button"
              onClick={() => onAddLesson(defaultFolderId)}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
            >
              <Plus size={16} />
              {t.addLesson.replace('...', '')}
            </button>
          ) : null}
        </div>

        {lessons.length === 0 ? (
          <EmptyState lang={lang} onAddFolder={onAddFolder} />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {lessons.map((lesson, index) => {
              const folder = folders.find((f) => f.id === lesson.folderId);
              return (
                <motion.article
                  key={lesson.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="group rounded-2xl border border-slate-200/90 bg-slate-50/80 p-4 transition-all hover:border-blue-300/60 hover:shadow-md dark:border-slate-700/90 dark:bg-slate-900/80 dark:hover:border-blue-700/50 dark:hover:bg-slate-900"
                >
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-blue-100/80 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                      <FolderOpen size={11} className="shrink-0" />
                      <span className="truncate">{folder?.name ?? '—'}</span>
                    </span>
                    {lesson.isFavorite ? (
                      <Star size={14} className="shrink-0 fill-amber-400 text-amber-400" />
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenLesson(lesson.id)}
                    className="mb-4 line-clamp-2 text-left text-[15px] font-semibold leading-snug text-slate-800 transition-colors group-hover:text-blue-700 dark:text-slate-200 dark:group-hover:text-blue-400"
                  >
                    {lesson.title}
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenLesson(lesson.id)}
                      className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-slate-200/70 px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-300/70 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <BookOpen size={14} />
                      {lang === 'kh' ? 'បើក' : 'Open'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditLesson(lesson.id)}
                      className="inline-flex items-center justify-center rounded-lg border border-slate-200 px-3 py-2 text-slate-500 transition-colors hover:border-blue-300 hover:text-blue-600 dark:border-slate-600 dark:text-slate-400 dark:hover:border-blue-700 dark:hover:text-blue-400"
                      title={t.edit}
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-12 grid gap-4 md:grid-cols-3">
        {features.map(({ icon: Icon, title, desc }) => (
          <div
            key={title}
            className="rounded-2xl border border-slate-200/80 bg-slate-50/50 p-5 dark:border-slate-700/80 dark:bg-slate-900/50"
          >
            <div className="mb-3 inline-flex rounded-xl bg-blue-100/70 p-2.5 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
              <Icon size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 dark:text-slate-500">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  className,
}: {
  label: string;
  value: number;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-slate-200/70 bg-white/60 px-4 py-3 dark:border-slate-700/70 dark:bg-slate-800/60',
        className
      )}
    >
      <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-bold text-slate-800 dark:text-slate-200">{value}</p>
    </div>
  );
}

function EmptyState({ lang, onAddFolder }: { lang: Language; onAddFolder: () => void }) {
  return (
    <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50/50 px-6 py-14 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <BookOpen size={44} className="mx-auto text-slate-300 dark:text-slate-600" />
      <p className="mt-4 text-base font-semibold text-slate-700 dark:text-slate-300">
        {lang === 'kh' ? 'មិនទាន់មានមេរៀននៅឡើយទេ' : 'No lessons yet'}
      </p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-500">
        {lang === 'kh'
          ? 'បង្កើតផ្ទាំងថ្មី រួចបន្ថែមមេរៀនដំបូងរបស់អ្នក'
          : 'Create a tab first, then add your first lesson'}
      </p>
      <button
        type="button"
        onClick={onAddFolder}
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500"
      >
        <Plus size={16} />
        {lang === 'kh' ? 'បង្កើតផ្ទាំងថ្មី' : 'Create new tab'}
      </button>
    </div>
  );
}
