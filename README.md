# shadow-me

Your digital twin AI agent that works on your behalf — powered by [Mastra](https://mastra.ai/), Google Gemini, and [MCP](https://modelcontextprotocol.io/).

## Architecture

```
Discord / Slack  →  shadow-me (Linear, MCP, …)  →  Linear（Cursor）
```

- **Discord or Slack**: You create or delegate tasks (e.g. “fix this bug”, “add this feature”). Those requests flow into the system.
- **shadow-me**: Acts as a bridge that wraps multiple tools — [Linear](https://linear.app/) for issues and task state, [MCP](https://modelcontextprotocol.io/) and other integrations for tooling. It receives inputs from chat, creates or updates Linear issues, and orchestrates work via those tools.
- **Cursor**: When you assign an issue to Cursor (or the Cursor agent) in Linear, Cursor picks up the task and executes it. So: **assign in Linear → Cursor runs the task**.

End-to-end: chat (Discord/Slack) → shadow-me (Linear, MCP, etc.) → assign to Cursor in Linear → Cursor performs the work.

## Setup

```bash
git clone https://github.com/newbee1939/shadow-me.git
cd shadow-me
npm ci
cp .env.example .env
```

[Add Mastra Docs MCP Server](https://mastra.ai/docs/build-with-ai/mcp-docs-server#cursor)

Set your credentials in `.env`:

Then start the dev server:

```bash
npm run dev
```
