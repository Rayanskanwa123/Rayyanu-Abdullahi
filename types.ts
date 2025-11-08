
import type { ReactNode } from 'react';

export enum ConversationStep {
  GREETING,
  SUBJECTS,
  INTERESTS,
  BUDGET,
  GENERATING,
  RESULTS,
  CHATTING,
}

export interface UserProfile {
  subjects: string[];
  interests: string[];
  budget: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: ReactNode;
}

export interface CareerPath {
  title: string;
  description: string;
  courses: string[];
}

export interface University {
  name: string;
  location: string;
  type: string;
}

export interface CareerAdviceResponse {
  careerPaths: CareerPath[];
  universities: University[];
  motivation: string;
}
