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

[Add Mastra Docs MCP Server](https://mastra.ai/docs/build-with-ai/mcp-docs-server#cursor)

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
