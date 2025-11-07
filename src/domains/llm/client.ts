// Domain layer - LLM integration (client-side API caller)

import { LLMRequest, LLMResponse } from '@/data/types';

export class LLMClient {
  private apiEndpoint: string;

  constructor(apiEndpoint: string = '/api/chat') {
    this.apiEndpoint = apiEndpoint;
  }

  async sendMessage(request: LLMRequest): Promise<LLMResponse> {
    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('LLM API call failed:', error);
      return {
        content: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      };
    }
  }
}
