import { memo, useMemo } from 'react';
import { Plus, GripVertical, Edit2, BookOpenText, FileText, Trash2 } from 'lucide-react';
import { Folder, Lesson } from '../types';
import { cn } from '../lib/utils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableLessonItemProps {
  lesson: Lesson;
  activeLessonId: string | null;
  onSelectLesson: (id: string, focusText?: string) => void;
  t: any;
}

const getLessonPreview = (raw: string) => {
  return raw
    .replace(/<[^>]*>/g, ' ')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_~`>#|-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

const getLessonOutlineLines = (raw: string) => {
  const normalized = raw
    .replace(/<[^>]*>/g, '\n')
    .replace(/```[\s\S]*?```/g, '\n')
    .replace(/!\[[^\]]*\]\([^)]+\)/g, '\n')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  return normalized
    .split('\n')
    .map((line) =>
      line
        .replace(/^#{1,6}\s+/, '')
        .replace(/^[-*+]\s+/, '')
        .replace(/^\d+\.\s+/, '')
        .replace(/`([^`]+)`/g, '$1')
        .replace(/[*_~`>#|-]+/g, ' ')
        .trim()
    )
    .filter((line) => line.length > 0)
    .slice(0, 14);
};

const SortableLessonItem = memo(function SortableLessonItem({ lesson, activeLessonId, onSelectLesson, t }: SortableLessonItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: lesson.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };
  const isActive = activeLessonId === lesson.id;
  const preview = useMemo(() => getLessonPreview(lesson.content), [lesson.content]);
  const outlineLines = useMemo(() => getLessonOutlineLines(lesson.content), [lesson.content]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group/item relative flex min-w-0 items-center"
    >
      <div 
        {...attributes} 
        {...listeners}
        className="absolute -left-1 top-1/2 z-10 hidden -translate-y-1/2 rounded p-0.5 text-slate-300 hover:text-slate-500 hover:bg-white cursor-grab active:cursor-grabbing group-hover/item:inline-flex"
      >
        <GripVertical size={14} />
      </div>

      <div className="relative min-w-0 flex-1">
        <div
          className={cn(
            "w-full min-w-0 px-1.5 py-1.5 text-left transition-all rounded-lg",
            isActive
              ? "bg-[#dfe9fb] text-[#1a56db]"
              : "text-slate-600 hover:bg-slate-100/70"
          )}
        >
          <button
            onClick={() => onSelectLesson(lesson.id)}
            className="block min-w-0 max-w-full truncate text-[13.5px] leading-tight font-semibold pr-1 text-left"
          >
            {lesson.title}
          </button>
          {isActive ? (
            <div className="mt-2 text-[12.5px] text-slate-700">
              <button
                onClick={() => onSelectLesson(lesson.id)}
                className="block w-full truncate text-left font-semibold text-slate-800 hover:text-blue-700"
                title={preview}
              >
                {preview || t.newLessonContent}
              </button>
              <div className="mt-1.5 max-h-56 overflow-y-auto no-scrollbar space-y-0 text-slate-700">
                {outlineLines.map((line, idx) => (
                  <button
                    key={`${lesson.id}-outline-${idx}`}
                    onClick={() => onSelectLesson(lesson.id, line)}
                    className="flex w-full items-center gap-1.5 rounded px-1 py-[3px] text-left hover:bg-slate-100 hover:text-blue-700"
                    title={line}
                  >
                    <FileText size={11} className="shrink-0 text-slate-400" />
                    <span className="truncate text-[12px]">{line}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <button
              onClick={() => onSelectLesson(lesson.id)}
              className="mt-1 block min-w-0 max-w-full truncate text-[12px] text-slate-500 hover:text-slate-700 text-left"
              title={preview}
            >
              {preview || t.newLessonContent}
            </button>
          )}
        </div>
      </div>
    </div>
  );
});

interface SidebarProps {
  folders: Folder[];
  lessons: Lesson[];
  activeLessonId: string | null;
  onSelectLesson: (id: string, focusText?: string) => void;
  onAddFolder: () => void;
  onAddLesson: (folderId: string) => void;
  onDeleteFolder: (id: string) => void;
  onUpdateFolder: (id: string, name: string) => void;
  onDeleteLesson: (id: string) => void;
  onReorderLessons: (lessonIds: string[], folderId: string) => void;
  t: any;
  className?: string;
}

export function Sidebar({
  folders,
  lessons,
  activeLessonId,
  onSelectLesson,
  onAddFolder,
  onAddLesson,
  onDeleteFolder,
  onUpdateFolder,
  onDeleteLesson,
  onReorderLessons,
  t,
  className
}: SidebarProps) {
  const sortedFolders = useMemo(
    () => [...folders].sort((a, b) => a.order - b.order),
    [folders]
  );
  const lessonsByFolder = useMemo(() => {
    const grouped = new Map<string, Lesson[]>();
    lessons.forEach((lesson) => {
      const list = grouped.get(lesson.folderId) || [];
      list.push(lesson);
      grouped.set(lesson.folderId, list);
    });
    grouped.forEach((list, key) => {
      grouped.set(key, [...list].sort((a, b) => a.order - b.order));
    });
    return grouped;
  }, [lessons]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
       activationConstraint: {
         distance: 8,
       },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent, folderId: string) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const folderLessons = lessonsByFolder.get(folderId) || [];
      
      const oldIndex = folderLessons.findIndex((l) => l.id === active.id);
      const newIndex = folderLessons.findIndex((l) => l.id === over.id);

      const newOrderedLessons = arrayMove(folderLessons, oldIndex, newIndex);
      onReorderLessons(newOrderedLessons.map(l => l.id), folderId);
    }
  };

  return (
    <div className={cn("flex h-full w-full flex-col bg-[#f3f5f9] border-r border-slate-200", className)}>
      <div className="px-3 pt-3 pb-2 border-b border-slate-200 bg-[#f3f5f9]">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
            {t.documentTabs}
          </h3>
          <button 
            onClick={onAddFolder}
            className="h-8 w-8 inline-flex items-center justify-center text-slate-500 hover:text-blue-600 rounded-full hover:bg-slate-100 transition-colors"
            title={t.addTab}
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2.5 custom-scrollbar">
        <div className="space-y-2.5">
          {sortedFolders.map((folder) => {
            const folderLessons = lessonsByFolder.get(folder.id) || [];

            return (
              <div key={folder.id} className="rounded-lg border border-slate-200 bg-[#f3f5f9] p-2 space-y-2">
                <div className="group flex items-center justify-between px-1">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <div className="h-2 w-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)] flex-shrink-0" />
                    <span className="truncate text-[13px] font-bold text-slate-800 tracking-tight">{folder.name}</span>
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => onAddLesson(folder.id)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-white"
                        title={t.addLesson}
                     >
                        <Plus size={14} />
                     </button>
                     <button 
                        onClick={() => {
                          const newName = window.prompt(t.renameTab, folder.name);
                          if (newName && newName !== folder.name) onUpdateFolder(folder.id, newName);
                        }}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-blue-600 hover:bg-white"
                        title={t.rename}
                     >
                        <Edit2 size={14} />
                     </button>
                     <button 
                        onClick={() => onDeleteFolder(folder.id)}
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md text-slate-400 hover:text-red-500 hover:bg-white"
                        title={t.delete}
                     >
                        <Trash2 size={14} />
                     </button>
                  </div>
                </div>

                <div className="ml-0.5 space-y-1">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={(e) => handleDragEnd(e, folder.id)}
                  >
                    <SortableContext
                      items={folderLessons.map(l => l.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {folderLessons.map((lesson) => (
                        <SortableLessonItem
                          key={lesson.id}
                          lesson={lesson}
                          activeLessonId={activeLessonId}
                          onSelectLesson={onSelectLesson}
                          t={t}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                  
                  {folderLessons.length === 0 && (
                    <button 
                      onClick={() => onAddLesson(folder.id)}
                      className="flex w-full items-center gap-2 px-3 py-2 text-xs text-slate-400 hover:text-blue-500 hover:bg-white/70 rounded-lg transition-colors italic"
                    >
                      <BookOpenText size={12} />
                      <Plus size={12} />
                      {t.addLesson}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
