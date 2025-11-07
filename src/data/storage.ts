// Data layer - Session storage management

import { ConversationData, Message, CollectedInfo } from './types';

const STORAGE_KEY = 'prompt-o-matic-conversation';

export class SessionStorage {
  static saveConversation(data: ConversationData): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  static loadConversation(): ConversationData | null {
    if (typeof window === 'undefined') return null;
    try {
      const data = sessionStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load conversation:', error);
      return null;
    }
  }

  static clearConversation(): void {
    if (typeof window === 'undefined') return;
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear conversation:', error);
    }
  }
}
