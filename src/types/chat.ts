import { Timestamp } from 'firebase/firestore';

export type UserRole = 'support' | 'client';

export interface User {
  username: string;
  password: string;
  role: UserRole;
  createdAt: Timestamp;
}

export interface Message {
  id: string;
  text: string;
  user: string;
  createdAt: Timestamp;
  seenBy: string[];
}

export interface ChatPreview {
  clientUsername: string;
  lastMessage?: Message;
  unreadCount: number;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: {
    username: string;
    role: UserRole;
  } | null;
}
