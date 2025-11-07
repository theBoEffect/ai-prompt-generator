import { NextRequest, NextResponse } from 'next/server';
import { TOOL_DEFINITIONS } from '@/domains/llm/tools';

const LLM_PROVIDER = process.env.LLM_PROVIDER || 'openai'; // 'openai' or 'anthropic'
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface RequestBody {
  messages: Message[];
  temperature?: number;
  maxTokens?: number;
}

interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

interface LLMResult {
  content: string;
  toolCalls?: ToolCall[];
}

async function callOpenAI(messages: Message[], temperature: number, maxTokens: number): Promise<LLMResult> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4-turbo-preview',
      messages: messages,
      temperature: temperature,
      max_tokens: maxTokens,
      tools: TOOL_DEFINITIONS.openai,
      tool_choice: 'auto',
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'OpenAI API error');
  }

  const data = await response.json();
  const message = data.choices[0].message;

  return {
    content: message.content || '',
    toolCalls: message.tool_calls?.map((tc: any) => ({
      id: tc.id,
      type: 'function',
      function: {
        name: tc.function.name,
        arguments: tc.function.arguments,
      },
    })),
  };
}

async function callAnthropic(messages: Message[], temperature: number, maxTokens: number): Promise<LLMResult> {
  const systemMessage = messages.find(m => m.role === 'system');
  const conversationMessages = messages.filter(m => m.role !== 'system');

  const anthropicMessages = conversationMessages.map(m => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content,
  }));

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY || '',
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature: temperature,
      system: systemMessage?.content || '',
      messages: anthropicMessages,
      tools: TOOL_DEFINITIONS.anthropic,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Anthropic API error');
  }

  const data = await response.json();

  // Extract text content
  const textContent = data.content.find((c: any) => c.type === 'text');
  const toolUse = data.content.find((c: any) => c.type === 'tool_use');

  const result: LLMResult = {
    content: textContent?.text || '',
  };

  // Convert Anthropic tool use to OpenAI format for consistency
  if (toolUse) {
    result.toolCalls = [{
      id: toolUse.id,
      type: 'function',
      function: {
        name: toolUse.name,
        arguments: JSON.stringify(toolUse.input),
      },
    }];
  }

  return result;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();
    const { messages, temperature = 0.7, maxTokens = 1000 } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages are required' },
        { status: 400 }
      );
    }

    if (LLM_PROVIDER === 'anthropic') {
      if (!ANTHROPIC_API_KEY) {
        return NextResponse.json(
          { error: 'Anthropic API key is not configured. Please set ANTHROPIC_API_KEY in your .env.local file.' },
          { status: 500 }
        );
      }
      const result = await callAnthropic(messages, temperature, maxTokens);
      return NextResponse.json(result);
    } else {
      if (!OPENAI_API_KEY) {
        return NextResponse.json(
          { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your .env.local file.' },
          { status: 500 }
        );
      }
      const result = await callOpenAI(messages, temperature, maxTokens);
      return NextResponse.json(result);
    }
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An error occurred' },
      { status: 500 }
    );
  }
}
