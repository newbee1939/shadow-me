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

## Project Structure

- **`agents/`**: LLM agents (like n8n Agent Nodes) - define AI behavior and instructions
- **`workflows/`**: Workflow definitions (like n8n workflows) - chain multiple steps together

Example: `workflows/newsletter-workflow.ts` uses `agents/newsletter-agent.ts` to generate newsletters from RSS feeds.

## Newsletter Workflow

Automated newsletter generation from RSS feeds: fetch → filter important news → generate newsletter with explanations.

Execute workflows via Mastra API endpoints or Studio UI (`npm run dev`).
