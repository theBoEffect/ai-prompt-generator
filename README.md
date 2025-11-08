# Prompt-o-matic

AI-powered prompt generator for creating architecturally sound web application prompts. Uses LLM function calling to conduct an intelligent interview and generate structured requirements.

## Features

- Natural conversation with adaptive follow-up questions
- LLM function calling for intelligent completion detection
- Generates prompts with architectural best practices
- One-click copy to clipboard
- Session persistence

## Quick Start

**Prerequisites:** Node.js 18+, OpenAI or Anthropic API key

1. Install dependencies:
   ```bash
   yarn install
   ```

2. Configure API key:
   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local`:
   ```bash
   LLM_PROVIDER=openai
   OPENAI_API_KEY=sk-your-key
   ```

   Get keys: [OpenAI](https://platform.openai.com/api-keys) | [Anthropic](https://console.anthropic.com/)

3. Run:
   ```bash
   yarn dev
   ```

   Open http://localhost:3000

## Docker

Build and run:
```bash
docker build -t prompt-o-matic .
docker run -p 8080:8080 -e OPENAI_API_KEY=sk-your-key prompt-o-matic
```

Or use an env file:
```bash
docker run -p 8080:8080 --env-file .env prompt-o-matic
```

### Deployment Example (Google Cloud Run)

This is one suggested deployment approach. The app can be deployed to any container platform.

```bash
# Build for linux/amd64
docker build --platform=linux/amd64 --no-cache -t gcr.io/your-gcp-project/prompt-o-matic .

# Push to GCR
docker push gcr.io/your-gcp-project/prompt-o-matic

# Deploy to Cloud Run
gcloud run deploy prompt-o-matic \
  --image gcr.io/your-gcp-project/prompt-o-matic:latest \
  --platform managed \
  --region us-east4 \
  --allow-unauthenticated \
  --update-secrets="OPENAI_API_KEY=YOUR_OPENAI_SECRET_KEY:latest"
```

**Note:** Requires GCP project, `gcloud` CLI, and API key in Secret Manager. For Anthropic, use `ANTHROPIC_API_KEY` and set `LLM_PROVIDER=anthropic`.

## Usage

The AI conducts a natural interview (5-7 questions) about your project and uses function calling to determine when it has enough information. It then generates a structured prompt with architectural best practices included.

## Documentation

- **Architecture**: See `ARCHITECTURE.md` for detailed layer separation
- **Function Calling**: See `FUNCTION_CALLING.md` for implementation details
- **Quick Start**: See `QUICKSTART.md` for 5-minute setup guide

## License

MIT
