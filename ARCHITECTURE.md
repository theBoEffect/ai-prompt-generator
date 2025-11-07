# Prompt-o-matic Architecture

This document describes the modular architecture of Prompt-o-matic, following strict separation of concerns across five distinct layers.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Application Entry                    │
│                    (Next.js App Router)                  │
│                      src/app/                            │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────┐
│                    FEATURES LAYER                        │
│                  Business Features                       │
│                    src/features/                         │
│                                                          │
│  • ChatBot - Orchestrates chat interview feature        │
│    - Manages conversation state                         │
│    - Coordinates domain and UI layers                   │
│    - Handles user interactions                          │
└───────────┬──────────────────────────┬──────────────────┘
            │                          │
            ▼                          ▼
┌────────────────────────┐  ┌────────────────────────────┐
│    DOMAINS LAYER       │  │      UI LAYER              │
│   Business Logic       │  │   Presentation             │
│    src/domains/        │  │     src/ui/                │
│                        │  │                            │
│  • llm/                │  │  • ChatMessage             │
│    - LLM API client    │  │  • ChatInput               │
│                        │  │  • PromptOutput            │
│  • prompt-generator/   │  │  • LoadingSpinner          │
│    - Prompt templates  │  │                            │
│    - Generation logic  │  │  Pure presentation         │
│    - Completion        │  │  No business logic         │
│      detection         │  │                            │
└───────────┬────────────┘  └────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────┐
│                     DATA LAYER                           │
│              Data Types & Storage                        │
│                     src/data/                            │
│                                                          │
│  • types.ts - Type definitions                          │
│  • storage.ts - Session storage management              │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                   SECURITY LAYER                         │
│                   src/security/                          │
│                                                          │
│  • API keys kept server-side (Next.js API routes)       │
│  • No authentication (public app)                       │
└─────────────────────────────────────────────────────────┘
```

## Layer Descriptions

### 1. Application Entry (src/app/)
- **Purpose**: Next.js App Router configuration
- **Responsibilities**:
  - Route definitions
  - Layout configuration
  - API route handlers (server-side)
- **Files**:
  - `page.tsx` - Main entry point
  - `layout.tsx` - Root layout
  - `api/chat/route.ts` - Server-side LLM API endpoint

### 2. Features Layer (src/features/)
- **Purpose**: Complete business features
- **Responsibilities**:
  - Orchestrate domains and UI components
  - Manage feature-specific state
  - Handle user workflows
  - Coordinate multiple domains
- **Key Rule**: Features use domains and UI, never the reverse
- **Files**:
  - `ChatBot/ChatBot.tsx` - Main chat interview feature

### 3. Domains Layer (src/domains/)
- **Purpose**: Core business logic and external integrations
- **Responsibilities**:
  - Business rules and algorithms
  - External API integrations
  - Domain-specific operations
  - Stateless business logic
- **Key Rule**: Domains are independent of UI and features
- **Directories**:
  - `llm/` - LLM integration domain
  - `prompt-generator/` - Prompt generation domain

### 4. UI Layer (src/ui/)
- **Purpose**: Reusable presentation components
- **Responsibilities**:
  - Display data
  - Handle user interactions via callbacks
  - Visual styling
- **Key Rule**: No business logic, only presentation
- **Files**:
  - `ChatMessage.tsx` - Display messages
  - `ChatInput.tsx` - User input component
  - `PromptOutput.tsx` - Generated prompt display
  - `LoadingSpinner.tsx` - Loading indicator

### 5. Data Layer (src/data/)
- **Purpose**: Data structures and persistence
- **Responsibilities**:
  - Type definitions
  - Data storage (session, local, remote)
  - Data models
- **Key Rule**: Pure data, no business logic
- **Files**:
  - `types.ts` - TypeScript interfaces
  - `storage.ts` - Session storage utilities

### 6. Security Layer
- **Purpose**: Authentication and authorization
- **Responsibilities**:
  - API key management (server-side)
  - User authentication (not needed for this app)
  - Access control
- **Implementation**: API keys stored in environment variables, accessed only server-side

## Data Flow

### User Message Flow
```
User Input (UI)
    ↓
ChatInput component
    ↓
ChatBot feature
    ↓
LLM domain (via API route)
    ↓
Server-side API call
    ↓
LLM Response
    ↓
ChatBot feature
    ↓
Session Storage (data layer)
    ↓
ChatMessage component (UI)
    ↓
Display to user
```

### Prompt Generation Flow
```
Conversation completion detected
    ↓
ChatBot feature
    ↓
PromptGenerator domain
    ↓
Extract conversation data
    ↓
Apply templates
    ↓
Return formatted prompt
    ↓
ChatBot feature
    ↓
PromptOutput component (UI)
    ↓
Display to user
```

## Dependency Rules

1. **Features** can use:
   - Domains
   - UI components
   - Data types

2. **Domains** can use:
   - Other domains (with care)
   - Data types
   - External libraries

3. **UI Components** can use:
   - Data types
   - Other UI components

4. **Data Layer**:
   - No dependencies on other layers
   - Pure data structures

## Benefits of This Architecture

1. **Testability**: Each layer can be tested independently
2. **Maintainability**: Clear boundaries make changes easier
3. **Scalability**: New features can be added without affecting existing code
4. **Reusability**: Domains and UI components can be reused
5. **AI-Friendly**: Clear structure helps AI agents understand and modify code
6. **Type Safety**: TypeScript enforces contracts between layers

## Adding New Features

To add a new feature:

1. **Identify required domains**: Determine what business logic is needed
2. **Create or reuse domains**: Build domain logic if not exists
3. **Design UI components**: Create reusable presentation components
4. **Build feature**: Orchestrate domains and UI in the features layer
5. **Add route**: Connect feature to app router

Example: Adding a "Prompt History" feature
```
1. Domain: Create history-manager domain
2. Data: Add history types to data layer
3. UI: Create HistoryList and HistoryItem components
4. Feature: Create HistoryViewer feature
5. Route: Add /history page in app router
```

## Technology Choices

These technologies were chosen to support the architecture:

- **Next.js**: Server/client separation, API routes for security
- **TypeScript**: Type safety across layers
- **React**: Component-based UI layer
- **Tailwind CSS**: Utility-first styling for UI layer
- **Session Storage**: Simple data persistence without backend
