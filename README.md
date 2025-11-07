# Prompt-o-matic

An AI-powered prompt generator that helps you create detailed, architecturally sound prompts for web application development. The app uses conversational AI to interview you about your project requirements and generates a comprehensive prompt that includes best practices for modular, scalable architecture.

## Features

- **Interactive AI Interview**: Natural conversation with an LLM to gather project requirements
- **Adaptive Questions**: Smart follow-up questions based on your responses
- **Architectural Best Practices**: Generated prompts include clear architectural guidance
- **Modern UI**: Clean, playful, and minimalist design
- **Easy Copy**: One-click copy of the generated prompt
- **Session Persistence**: Your conversation is saved during the browser session

## Architecture

This application follows a strict modular architecture with clear separation of concerns:

```
src/
├── app/              # Next.js app router (entry point)
├── ui/               # UI layer - reusable components
├── features/         # Features layer - composed functionality
├── domains/          # Domain layer - business logic
│   ├── llm/          # LLM integration
│   └── prompt-generator/  # Prompt generation logic
└── data/             # Data layer - types and storage
```

### Layer Responsibilities

- **UI Layer**: Pure presentation components, no business logic
- **Features Layer**: Orchestrates domains and UI to deliver complete features
- **Domains Layer**: Core business logic and external service integration
- **Data Layer**: Type definitions and data persistence (session storage)

## Setup

### Prerequisites

- Node.js 18+ installed
- An API key from either OpenAI or Anthropic

### Installation

1. **Clone or download this project**

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure your API key**:

   Copy the example environment file:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your API key:

   **For OpenAI** (recommended):
   ```
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

   **For Anthropic Claude**:
   ```
   LLM_PROVIDER=anthropic
   ANTHROPIC_API_KEY=sk-ant-your-actual-api-key-here
   ```

   **Where to get API keys**:
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open your browser** to http://localhost:3000

## Docker Deployment

### Quick Start with Docker

The application is fully containerized and ready to deploy with Docker.

1. **Build the Docker image**:
   ```bash
   docker build -t prompt-o-matic .
   ```

2. **Run the container**:
   ```bash
   docker run -p 3000:3000 \
     -e LLM_PROVIDER=openai \
     -e OPENAI_API_KEY=your-api-key-here \
     prompt-o-matic
   ```

3. **Open your browser** to http://localhost:3000

### Docker Environment Variables

Pass environment variables using `-e` flag:

**For OpenAI**:
```bash
docker run -p 3000:3000 \
  -e LLM_PROVIDER=openai \
  -e OPENAI_API_KEY=sk-your-actual-key \
  prompt-o-matic
```

**For Anthropic Claude**:
```bash
docker run -p 3000:3000 \
  -e LLM_PROVIDER=anthropic \
  -e ANTHROPIC_API_KEY=sk-ant-your-actual-key \
  prompt-o-matic
```

### Using Environment File

Create a `.env` file:
```bash
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-key
```

Run with env file:
```bash
docker run -p 3000:3000 --env-file .env prompt-o-matic
```

### Docker Image Details

- **Base**: Node.js 20 Alpine (minimal footprint)
- **Multi-stage build**: Optimized for production
- **Non-root user**: Runs as user `nextjs` (UID 1001)
- **Port**: Exposes port 3000
- **Size**: ~150MB (optimized with standalone output)

### Production Deployment

For production deployment, you can:

1. **Push to a registry**:
   ```bash
   docker tag prompt-o-matic your-registry/prompt-o-matic:latest
   docker push your-registry/prompt-o-matic:latest
   ```

2. **Deploy to any container platform**:
   - AWS ECS
   - Google Cloud Run
   - Azure Container Instances
   - Kubernetes
   - DigitalOcean App Platform
   - Railway
   - Render

3. **Example Cloud Run deployment**:
   ```bash
   gcloud run deploy prompt-o-matic \
     --image your-registry/prompt-o-matic:latest \
     --platform managed \
     --set-env-vars LLM_PROVIDER=openai,OPENAI_API_KEY=your-key
   ```

## Usage

1. **Start the conversation**: The AI will greet you and ask the first question
2. **Answer naturally**: Respond to questions about your project
3. **Provide details**: The AI will ask follow-up questions if it needs more information
4. **Get your prompt**: After 5-7 questions, the AI will generate your prompt
5. **Copy and use**: Click the copy button to use your prompt with AI coding tools

## How It Works

The application uses **LLM function calling** for natural, intelligent prompt generation:

### Interview Phase
The AI conducts a natural conversation to understand your project:

1. **Purpose & Goals**: What you're trying to build and why
2. **Target Users**: Who will use the application
3. **Key Features**: Main functionality and capabilities
4. **Data Requirements**: What information needs to be managed
5. **Persistence**: How data should be stored
6. **User Flows**: How users will interact with the app
7. **Security**: Authentication and authorization needs
8. **Constraints**: Technical requirements or limitations

### Intelligent Completion
Instead of counting questions or parsing keywords, the LLM uses **function calling** to:
- Decide when it has enough information
- Call the `generate_final_prompt` function with structured data
- Provide requirements in a well-organized format

### Generated Prompt
The final prompt includes:
- Your project requirements in a clear, structured format
- Architectural guidelines for separation of concerns
- Best practices for scalable, maintainable code
- Security considerations
- Implementation requirements

This approach ensures natural conversation flow while producing high-quality, structured output.

## Technology Stack

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling
- **OpenAI/Anthropic APIs**: LLM integration for conversations

## Project Structure

```
prompt-o-matic/
├── src/
│   ├── app/                    # Next.js app router
│   │   ├── api/chat/           # Server-side API endpoint
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Home page
│   │   └── globals.css         # Global styles
│   ├── ui/                     # UI Components
│   │   ├── ChatMessage.tsx     # Message display
│   │   ├── ChatInput.tsx       # User input
│   │   ├── PromptOutput.tsx    # Generated prompt display
│   │   └── LoadingSpinner.tsx  # Loading indicator
│   ├── features/               # Features
│   │   └── ChatBot/            # Main chat feature
│   │       └── ChatBot.tsx     # Feature orchestration
│   ├── domains/                # Domain logic
│   │   ├── llm/                # LLM integration
│   │   │   └── client.ts       # API client
│   │   └── prompt-generator/   # Prompt generation
│   │       └── generator.ts    # Prompt logic
│   └── data/                   # Data layer
│       ├── types.ts            # Type definitions
│       └── storage.ts          # Session storage
├── .env.local                  # Your API keys (not in git)
├── .env.local.example          # Example configuration
├── package.json                # Dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.ts          # Tailwind config
└── README.md                   # This file
```

## Development

### Adding a New LLM Provider

1. Add provider logic to `src/app/api/chat/route.ts`
2. Update `.env.local.example` with new configuration
3. Test the integration

### Modifying the Interview Questions

Edit `src/domains/prompt-generator/generator.ts` to customize:
- The system prompt (questions and guidelines)
- The final prompt template
- Conversation completion detection

### Customizing the UI

Modify components in `src/ui/` to change:
- Colors and styling (using Tailwind classes)
- Layout and spacing
- Animations and transitions

## Troubleshooting

### "API key is not configured" error

- Make sure you created `.env.local` file
- Verify the API key is correctly copied
- Restart the development server after adding the key

### API calls failing

- Check your API key is valid
- Verify you have credits/access with your LLM provider
- Check the browser console for detailed error messages

### Chat not responding

- Open browser developer tools (F12) and check the Console tab
- Look for error messages in the terminal running the dev server
- Verify your internet connection

## License

MIT

## Credits

Built with modern web development best practices and architectural patterns for AI agent compatibility.
