// Data layer - Type definitions for the application

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  toolCalls?: ToolCall[];
}

export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface ConversationData {
  messages: Message[];
  collectedInfo: CollectedInfo;
}

export interface CollectedInfo {
  purpose?: string;
  targetUsers?: string;
  keyFeatures?: string;
  dataTypes?: string;
  persistence?: string;
  userFlows?: string;
  constraints?: string;
  [key: string]: string | undefined;
}

export interface ProjectRequirements {
  purpose: string;
  targetUsers: string;
  features: string[];
  dataModel: string;
  persistence: string;
  userFlows: string;
  security: string;
  constraints: string;
}

export interface LLMRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMResponse {
  content: string;
  error?: string;
  toolCalls?: ToolCall[];
}
