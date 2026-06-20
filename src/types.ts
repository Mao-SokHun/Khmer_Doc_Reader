export interface Folder {
  id: string;
  name: string;
  ownerId: string;
  order: number;
}

export interface Lesson {
  id: string;
  folderId: string;
  title: string;
  content: string;
  order: number;
  ownerId: string;
  tags?: string[];
  isFavorite?: boolean;
}

export type ShareRole = 'viewer' | 'commenter' | 'editor';
export type ShareAccess = 'anyone' | 'restricted';

export type LessonShare = {
  token: string;
  lessonId: string;
  role: ShareRole;
  access: ShareAccess;
  expiresAt?: string | null;
};

export type SharedLessonPayload = {
  share: LessonShare;
  lesson: Pick<Lesson, 'id' | 'title' | 'content' | 'folderId'>;
};


