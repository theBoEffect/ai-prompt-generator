# Function Calling Implementation

This document explains how Prompt-o-matic uses LLM function calling (tool use) to enable natural, intelligent prompt generation.

## Overview

Function calling allows the LLM to directly invoke application functions with structured data. When the AI determines it has gathered sufficient information, it calls `generate_final_prompt` with a structured requirements object.

**How it works:**
```typescript
LLM decides: "I have enough info"
LLM calls: generate_final_prompt({ purpose: "...", features: [...], ... })
App receives: Structured, validated data
```

**Benefits:**
- Native LLM capability (reliable)
- Structured, type-safe data
- LLM controls conversation flow
- Adapts to conversation (3-10+ questions)

## Architecture

### Tool Definition
Located in `src/domains/llm/tools.ts`:

```typescript
{
  name: 'generate_final_prompt',
  description: 'Call when you have enough information...',
  parameters: {
    purpose: string,
    targetUsers: string,
    features: string[],
    dataModel: string,
    persistence: string,
    userFlows: string,
    security: string,
    constraints: string
  }
}
```

### Flow Diagram

```
User Input
    ↓
ChatBot Feature
    ↓
LLM API (with tools defined)
    ↓
┌─────────────────┐
│ LLM Decision    │
└─────────────────┘
    ↓
┌─────────────────────────────┐
│ Enough Info?                │
├─────────────────────────────┤
│ No  → Ask follow-up question│
│ Yes → Call tool with data   │
└─────────────────────────────┘
    ↓
Tool Call Received
    ↓
Parse Structured Data
    ↓
Generate Final Prompt
    ↓
Display to User
```

## Implementation Details

### 1. API Route (Server-Side)
`src/app/api/chat/route.ts`

Both OpenAI and Anthropic support tool calling, but with different formats:

#### OpenAI
```typescript
const response = await fetch('https://api.openai.com/v1/chat/completions', {
  body: JSON.stringify({
    model: 'gpt-4-turbo-preview',
    messages: messages,
    tools: TOOL_DEFINITIONS.openai,  // ← Tools enabled
    tool_choice: 'auto',              // ← LLM decides when to call
  }),
});

// Response includes:
{
  content: "follow-up question...",
  tool_calls: [
    {
      id: "call_xyz",
      type: "function",
      function: {
        name: "generate_final_prompt",
        arguments: '{"purpose": "...", ...}'
      }
    }
  ]
}
```

#### Anthropic
```typescript
const response = await fetch('https://api.anthropic.com/v1/messages', {
  body: JSON.stringify({
    model: 'claude-3-5-sonnet-20241022',
    messages: messages,
    tools: TOOL_DEFINITIONS.anthropic,  // ← Tools enabled
  }),
});

// Response includes:
{
  content: [
    { type: "text", text: "follow-up question..." },
    {
      type: "tool_use",
      id: "toolu_xyz",
      name: "generate_final_prompt",
      input: { purpose: "...", ... }
    }
  ]
}
```

We normalize both formats to a consistent structure.

### 2. ChatBot Feature
`src/features/ChatBot/ChatBot.tsx`

```typescript
const handleSendMessage = async (content: string) => {
  const response = await llmClient.sendMessage({ messages });

  // Check for tool calls
  if (response.toolCalls && response.toolCalls.length > 0) {
    const toolCall = response.toolCalls[0];

    if (toolCall.function.name === 'generate_final_prompt') {
      // Parse structured requirements
      const requirements: ProjectRequirements =
        JSON.parse(toolCall.function.arguments);

      // Generate final prompt with structured data
      const prompt = promptGenerator.generateFinalPrompt(requirements);
      setGeneratedPrompt(prompt);
      setIsComplete(true);
    }
  } else {
    // Regular conversation message
    setMessages([...messages, response]);
  }
};
```

### 3. Prompt Generator
`src/domains/prompt-generator/generator.ts`

```typescript
generateFinalPrompt(requirements: ProjectRequirements): string {
  // Use structured data, not Q&A dump
  return `
ARCHITECTURE CONTEXT: ${ARCHITECTURE_CONTEXT}

PURPOSE:
${requirements.purpose}

TARGET USERS:
${requirements.targetUsers}

FEATURES:
${requirements.features.map((f, i) => `  ${i + 1}. ${f}`).join('\n')}

// ... etc
`;
}
```

## Data Flow

### Normal Conversation Turn
```
User: "I want to build a task manager"
    ↓
LLM: "Great! Who will be using this task manager?"
    ↓
Response: { content: "Great! Who...", toolCalls: null }
    ↓
Display message and continue
```

### Completion Turn
```
User: "Anyone with a login can use it"
    ↓
LLM: *decides it has enough info*
LLM: *calls generate_final_prompt with structured data*
    ↓
Response: {
  content: "",
  toolCalls: [{
    function: {
      name: "generate_final_prompt",
      arguments: '{"purpose": "...", "features": [...], ...}'
    }
  }]
}
    ↓
Parse arguments → ProjectRequirements
    ↓
Generate structured prompt
    ↓
Display final prompt
```

## Key Features

### Natural Conversation
The LLM controls when to complete based on information quality, not a fixed question count.

### Structured Output
Direct access to typed data:
```typescript
const purpose = requirements.purpose;
const features = requirements.features; // string[]
```

### Type Safety
TypeScript validates the structure:
```typescript
interface ProjectRequirements {
  purpose: string;
  features: string[];
  // ... all fields type-checked
}
```

### Extensibility
Additional tools can be added to the tool definition array.

## Testing Function Calls

### Manual Testing
1. Start conversation
2. Provide detailed answers
3. Watch for completion message
4. Verify structured prompt output

### Check Tool Call in Browser DevTools
```javascript
// Network tab → /api/chat response
{
  "content": "",
  "toolCalls": [{
    "id": "call_abc123",
    "type": "function",
    "function": {
      "name": "generate_final_prompt",
      "arguments": "{\"purpose\":\"...\", ...}"
    }
  }]
}
```

### Verify Structured Data
```javascript
// Console logs in ChatBot.tsx
console.log('Tool call detected:', toolCall);
console.log('Parsed requirements:', requirements);
```

## Troubleshooting

### Tool Never Gets Called
**Issue**: LLM asks many questions but never completes

**Solutions**:
- Provide more detailed answers
- Use a more capable model (GPT-4, Claude 3.5 Sonnet)
- Adjust system prompt to be more decisive

### Parse Error
**Issue**: `Failed to parse tool call arguments`

**Solutions**:
- Check LLM model supports function calling
- Verify tool definition syntax
- Ensure API key has access to tool-capable models

### Wrong Data Structure
**Issue**: Missing or incorrect fields

**Solutions**:
- Review tool definition in `src/domains/llm/tools.ts`
- Ensure all required fields are marked in schema
- Check LLM is using correct parameter names

## References

- [OpenAI Function Calling](https://platform.openai.com/docs/guides/function-calling)
- [Anthropic Tool Use](https://docs.anthropic.com/claude/docs/tool-use)
