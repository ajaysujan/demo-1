export interface Message {
  id: string;
  type: 'user' | 'aura';
  text: string;
  timestamp: number;
  imageUrl?: string;
  isImage?: boolean;
  deepThink?: boolean;
  smartSearch?: boolean;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  created?: number;
  updated?: number;
  updatedAt?: number;
}

export interface SubjectItem {
  id: string;
  name: string;
  icon: string;
  badge?: string;
  chapters: string[];
  keyFormulas: string[];
  sampleQuestions: string[];
}

export interface UserAccount {
  username: string;
  name: string;
  grade: string;
  board: string;
  avatarSeed: string;
  createdAt: number;
}
