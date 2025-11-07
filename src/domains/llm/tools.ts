// Domain layer - Tool definitions for LLM function calling

export const TOOL_DEFINITIONS = {
  openai: [
    {
      type: 'function' as const,
      function: {
        name: 'generate_final_prompt',
        description: 'Call this function when you have gathered enough information to create a comprehensive application prompt. Only call this when you are confident you understand the project requirements.',
        parameters: {
          type: 'object',
          properties: {
            purpose: {
              type: 'string',
              description: 'Clear description of what the application does and why it exists',
            },
            targetUsers: {
              type: 'string',
              description: 'Who will use the application and their key needs or characteristics',
            },
            features: {
              type: 'array',
              items: { type: 'string' },
              description: 'List of key features and functionality the application should have',
            },
            dataModel: {
              type: 'string',
              description: 'What types of data the application manages and their relationships',
            },
            persistence: {
              type: 'string',
              description: 'How and where data should be stored (database, sessions, external APIs, etc.)',
            },
            userFlows: {
              type: 'string',
              description: 'Main user journeys and how users will interact with the application',
            },
            security: {
              type: 'string',
              description: 'Authentication and authorization requirements (e.g., "public", "user login required", "role-based access")',
            },
            constraints: {
              type: 'string',
              description: 'Technical requirements, preferences, or constraints (frameworks, deployment, APIs, etc.)',
            },
          },
          required: [
            'purpose',
            'targetUsers',
            'features',
            'dataModel',
            'persistence',
            'userFlows',
            'security',
            'constraints',
          ],
        },
      },
    },
  ],
  anthropic: [
    {
      name: 'generate_final_prompt',
      description: 'Call this function when you have gathered enough information to create a comprehensive application prompt. Only call this when you are confident you understand the project requirements.',
      input_schema: {
        type: 'object',
        properties: {
          purpose: {
            type: 'string',
            description: 'Clear description of what the application does and why it exists',
          },
          targetUsers: {
            type: 'string',
            description: 'Who will use the application and their key needs or characteristics',
          },
          features: {
            type: 'array',
            items: { type: 'string' },
            description: 'List of key features and functionality the application should have',
          },
          dataModel: {
            type: 'string',
            description: 'What types of data the application manages and their relationships',
          },
          persistence: {
            type: 'string',
            description: 'How and where data should be stored (database, sessions, external APIs, etc.)',
          },
          userFlows: {
            type: 'string',
            description: 'Main user journeys and how users will interact with the application',
          },
          security: {
            type: 'string',
            description: 'Authentication and authorization requirements (e.g., "public", "user login required", "role-based access")',
          },
          constraints: {
            type: 'string',
            description: 'Technical requirements, preferences, or constraints (frameworks, deployment, APIs, etc.)',
          },
        },
        required: [
          'purpose',
          'targetUsers',
          'features',
          'dataModel',
          'persistence',
          'userFlows',
          'security',
          'constraints',
        ],
      },
    },
  ],
};
