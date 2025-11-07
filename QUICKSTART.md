# Quick Start Guide

Get Prompt-o-matic running in 5 minutes!

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Get an API Key

Choose one:

### Option A: OpenAI (Recommended)
1. Go to https://platform.openai.com/api-keys
2. Sign up or log in
3. Create a new API key
4. Copy the key (starts with `sk-`)

### Option B: Anthropic Claude
1. Go to https://console.anthropic.com/
2. Sign up or log in
3. Get your API key
4. Copy the key (starts with `sk-ant-`)

## Step 3: Configure Your API Key

Create a file named `.env.local` in the project root:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and add your key:

**For OpenAI:**
```
LLM_PROVIDER=openai
OPENAI_API_KEY=sk-your-actual-key-here
```

**For Anthropic:**
```
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=sk-ant-your-actual-key-here
```

## Step 4: Run the App

```bash
npm run dev
```

## Step 5: Open in Browser

Go to http://localhost:3000

That's it! Start chatting with the AI to generate your prompt.

## Troubleshooting

### "API key is not configured"
- Make sure `.env.local` file exists
- Check that the API key is correct
- Restart the dev server

### Port 3000 already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Build issues
```bash
# Clear Next.js cache
rm -rf .next
npm run dev
```

## What's Next?

1. **Chat with the AI** - Answer 5-7 questions about your project
2. **Get your prompt** - The AI generates a detailed prompt
3. **Copy and use** - Use the prompt with Claude Code or other AI tools

## Tips for Better Prompts

- **Be specific**: Include details about features and requirements
- **Think about users**: Describe who will use your app and how
- **Mention constraints**: API preferences, database choices, hosting needs
- **Describe flows**: Explain how users will navigate your app

Enjoy building! 🚀
