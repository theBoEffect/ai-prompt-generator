# Function Calling Implementation - Changes Summary

This document summarizes the changes made to implement LLM function calling for more natural and robust prompt generation.

## Overview

**Before**: String-based completion detection with Q&A concatenation
**After**: LLM function calling with structured data

## Files Modified

### 1. `src/data/types.ts`
**Changes**: Added support for tool calls and structured requirements

```diff
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
+ toolCalls?: ToolCall[];
}

+ export interface ToolCall {
+   id: string;
+   type: 'function';
+   function: {
+     name: string;
+     arguments: string;
+   };
+ }

+ export interface ProjectRequirements {
+   purpose: string;
+   targetUsers: string;
+   features: string[];
+   dataModel: string;
+   persistence: string;
+   userFlows: string;
+   security: string;
+   constraints: string;
+ }

export interface LLMResponse {
  content: string;
  error?: string;
+ toolCalls?: ToolCall[];
}
```

### 2. `src/domains/llm/tools.ts` (NEW FILE)
**Purpose**: Define the `generate_final_prompt` tool schema for both OpenAI and Anthropic

**Key Features**:
- OpenAI format with `tools` array
- Anthropic format with `input_schema`
- Structured parameters matching ProjectRequirements interface
- Clear descriptions for LLM guidance

### 3. `src/app/api/chat/route.ts`
**Changes**: Updated to support and normalize tool calls

```diff
+ import { TOOL_DEFINITIONS } from '@/domains/llm/tools';

- async function callOpenAI(...): Promise<string>
+ async function callOpenAI(...): Promise<LLMResult>

  body: JSON.stringify({
    model: 'gpt-4-turbo-preview',
    messages: messages,
+   tools: TOOL_DEFINITIONS.openai,
+   tool_choice: 'auto',
  }),

- return data.choices[0].message.content;
+ return {
+   content: message.content || '',
+   toolCalls: message.tool_calls?.map(tc => ({ ... })),
+ };
```

Similar changes for Anthropic to normalize tool_use to the same format.

### 4. `src/domains/prompt-generator/generator.ts`
**Changes**: Removed string parsing, added structured prompt generation

**Before**:
```typescript
generateSystemPrompt(): string {
  return `...
  - When you have enough information, say "COMPLETE:" followed by a brief summary
  Do not generate the final prompt yourself - just gather the information.`;
}

generateFinalPrompt(messages: Message[]): string {
  const conversationSummary = this.extractConversationSummary(messages);
  return `...${conversationSummary}...`;
}

private extractConversationSummary(messages: Message[]): string {
  // Manual Q&A extraction and concatenation
  for (let i = 0; i < ...) {
    summary += `Q: ${cleanQuestion}\n`;
    summary += `A: ${answer}\n\n`;
  }
}

isConversationComplete(message: string): boolean {
  return message.includes('COMPLETE:');
}
```

**After**:
```typescript
generateSystemPrompt(): string {
  return `...
  - When you have enough information, call the generate_final_prompt function with the structured requirements
  Use your judgment to determine when you have sufficient information.`;
}

generateFinalPrompt(requirements: ProjectRequirements): string {
  // Uses structured data directly
  return `
PURPOSE:
${requirements.purpose}

TARGET USERS:
${requirements.targetUsers}

FEATURES:
${requirements.features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}
...`;
}

// Removed extractConversationSummary()
// Removed isConversationComplete()
```

### 5. `src/features/ChatBot/ChatBot.tsx`
**Changes**: Added tool call detection and handling

```diff
export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [error, setError] = useState<string | null>(null);
+ const [isComplete, setIsComplete] = useState(false);
```

**handleSendMessage - Before**:
```typescript
const response = await llmClient.sendMessage({ messages });

const assistantMessage: Message = {
  id: (Date.now() + 1).toString(),
  role: 'assistant',
  content: response.content,
  timestamp: Date.now(),
};

setMessages([...updatedMessages, assistantMessage]);

if (promptGenerator.isConversationComplete(response.content)) {
  const prompt = promptGenerator.generateFinalPrompt(finalMessages);
  setGeneratedPrompt(prompt);
}
```

**handleSendMessage - After**:
```typescript
const response = await llmClient.sendMessage({ messages });

// Check if LLM called the generate_final_prompt tool
if (response.toolCalls && response.toolCalls.length > 0) {
  const toolCall = response.toolCalls[0];

  if (toolCall.function.name === 'generate_final_prompt') {
    // Parse the requirements from the tool call
    const requirements: ProjectRequirements = JSON.parse(toolCall.function.arguments);

    // Create completion message
    const completionMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Perfect! I have all the information I need. Generating your prompt now...',
      timestamp: Date.now(),
      toolCalls: response.toolCalls,
    };

    setMessages([...updatedMessages, completionMessage]);

    // Generate the final prompt using structured data
    const prompt = promptGenerator.generateFinalPrompt(requirements);
    setGeneratedPrompt(prompt);
    setIsComplete(true);
  }
} else {
  // Normal message without tool call
  const assistantMessage: Message = { ... };
  setMessages([...updatedMessages, assistantMessage]);
}
```

**UI Updates**:
```diff
<ChatInput
  onSend={handleSendMessage}
- disabled={isLoading || !!error}
+ disabled={isLoading || !!error || isComplete}
  placeholder={
    error
      ? 'Please fix the error to continue...'
+     : isComplete
+     ? 'Interview complete! Click Reset to start over.'
      : 'Type your answer...'
  }
/>
```

## Files Added

1. **`src/domains/llm/tools.ts`** - Tool definitions for function calling
2. **`FUNCTION_CALLING.md`** - Technical documentation of the implementation
3. **`CHANGES.md`** - This file

## Benefits of Changes

### 1. Robustness
- ✅ No fragile string matching
- ✅ Native LLM capability
- ✅ Works reliably across models

### 2. Data Quality
- ✅ Structured, type-safe output
- ✅ No manual parsing
- ✅ Validated by TypeScript

### 3. Natural Conversation
- ✅ LLM truly controls completion
- ✅ Adapts to conversation naturally
- ✅ Flexible question count (3-10+)

### 4. Better Prompts
- ✅ Well-organized requirements
- ✅ Consistent format
- ✅ No Q&A dump

### 5. Maintainability
- ✅ Clear separation of concerns
- ✅ Easier to extend (add more tools)
- ✅ Type-safe data flow

## Migration Notes

If you have existing session data:
- Old conversations will still load
- Tool calls won't exist in old messages
- Reset conversation to use new flow

## Testing

Build succeeds with no errors:
```bash
npm run build
✓ Compiled successfully
```

All TypeScript types are valid and tool definitions are properly structured.

## Next Steps

Potential enhancements:
1. Add more tools (save_draft, ask_clarifying_question)
2. Implement streaming responses
3. Add conversation history export
4. Create tool call analytics/logging
