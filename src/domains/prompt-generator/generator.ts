// Domain layer - Prompt generation logic

import { ProjectRequirements } from '@/data/types';

const ARCHITECTURE_CONTEXT = `Implement a modular architecture with physical separation. Define and adhere to an architecture pattern that clearly separates security, UI, features, domain, and data layers for scalability. Security is who can access what parts of your application. Some users are guests, others are admins with full access. UI is the interactive rendered application on the browser representing user flows and actions and is composed of features. Features are groupings of interactive functionality such as navigation bars, dashboards, forms, pages—the distinct pieces users interact with to accomplish tasks. Domains are common underlying groupings that features call upon to display information and enable interactions in different ways, typically through an API. A small number of domains can enable a large number of features and features are agnostic of the domain layer. The data layer is the underlying information each domain manages, stored in databases, sessions, or external systems accessed through APIs and is updated as users interact with the app. The resulting code should be modular, scalable, testable, and maintainable. Code in one layer should not extend into other layers. Choose a technology stack that makes it easy to adhere to these requirements.`;

export class PromptGenerator {
  generateSystemPrompt(): string {
    return `You are an expert interviewer helping users create detailed prompts for AI-powered web application development. Your goal is to gather comprehensive information through natural conversation.

Ask thoughtful follow-up questions to understand:
1. The application's purpose and goals
2. Target users and their needs
3. Key features and functionality
4. Data types and structures needed
5. Data persistence requirements
6. User flows and interactions
7. Authentication/authorization requirements
8. Technical constraints or preferences

Guidelines:
- Ask 5-7 questions total, adapting based on responses
- Be conversational and friendly, not robotic
- Ask follow-up questions when answers lack detail
- Probe for specifics when users are vague
- Stay focused on gathering requirements (don't engage in off-topic chat)
- When you have enough information, call the generate_final_prompt function with the structured requirements

Use your judgment to determine when you have sufficient information. Don't rush, but don't over-ask either.`;
  }

  generateFinalPrompt(requirements: ProjectRequirements): string {
    const featuresFormatted = requirements.features
      .map((f, i) => `  ${i + 1}. ${f}`)
      .join('\n');

    return `Create a web application with the following requirements:

ARCHITECTURE CONTEXT: ${ARCHITECTURE_CONTEXT}

PROJECT REQUIREMENTS:

PURPOSE:
${requirements.purpose}

TARGET USERS:
${requirements.targetUsers}

FEATURES:
${featuresFormatted}

DATA MODEL:
${requirements.dataModel}

DATA PERSISTENCE:
${requirements.persistence}

USER FLOWS:
${requirements.userFlows}

SECURITY:
${requirements.security}

TECHNICAL CONSTRAINTS:
${requirements.constraints}

IMPLEMENTATION REQUIREMENTS:
- The application must be functional and ready to use upon completion with real API calls and data persistence - do not use mock data, simulated responses, or placeholder implementations. 
- Follow the architectural separation defined above (security, UI, features, domains, data).
- If the system being designed uses LLM/AI to do any sort of in-system or external CRUD operations, use function calling patterns.
- Never hardcode API keys, secrets, or credentials in source code. Always use environment variables and keep them server-side.
- Use parameterized queries or ORM methods to prevent SQL injection. Sanitize all user-generated content to prevent XSS attacks.
- Include clear documentation for setup and configuration
- Implement proper error handling and validation
- Use modern best practices and clean code principles`;
  }
}
