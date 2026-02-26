# shadow-me

Your digital twin AI agent powered by [Mastra](https://mastra.ai/), Google Gemini, and [MCP](https://modelcontextprotocol.io/).

## Architecture

```
Slack → shadow-me (Linear, MCP, …) → Linear → Cursor
```

- **Slack**: Create or delegate tasks via chat
- **shadow-me**: AI agent that orchestrates tools (Linear, MCP, etc.) and manages task state
- **Cursor**: Executes tasks assigned in Linear

## Setup

```bash
git clone https://github.com/newbee1939/shadow-me.git
cd shadow-me
npm ci
cp .env.example .env
```

[Enable Mastra Docs MCP Server](https://mastra.ai/docs/build-with-ai/mcp-docs-server#cursor)

Set your credentials in `.env`, then:

```bash
npm run dev
```

## Development

### Code Quality

This project uses several tools to maintain code quality:

- **Biome**: Linting and formatting
  ```bash
  npm run lint
  npm run format
  ```

- **Knip**: Find unused files, dependencies, and exports
  ```bash
  npm run knip
  ```

- **Vitest**: Testing framework
  ```bash
  npm run test
  ```

### Local Slack App Testing

To test the Slack app locally with webhooks:

```bash
brew install ngrok

# Expose local port 4111 for incoming webhooks
ngrok http 4111

# Start the development server
npm run dev
```

Then configure your Slack app's request URLs (e.g. event subscriptions, slash commands) to use the HTTPS URL provided by `ngrok`.
