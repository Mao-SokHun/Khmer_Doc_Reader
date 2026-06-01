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
}


