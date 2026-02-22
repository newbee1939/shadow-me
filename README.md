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

## Code Quality

### Knip Integration

This project uses [Knip](https://knip.dev/) to detect unused files, dependencies, and exports, integrated with AI agents for automated code cleanup.

#### Run Knip Analysis

```bash
npm run knip
```

#### Auto-fix Issues (use with caution)

```bash
npm run knip:fix
```

#### AI-Powered Code Cleanup

The `knipAgent` can analyze your codebase and provide intelligent recommendations:

```bash
npm run dev
# Then interact with the knip-cleaner agent
```

#### GitHub Actions

Knip analysis runs automatically on:
- Pull requests to main
- Push to main
- Weekly schedule (Monday at midnight UTC)

Results are commented on PRs and uploaded as artifacts.
