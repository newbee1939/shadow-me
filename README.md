# shadow-me

Your digital twin AI agent powered by [Mastra](https://mastra.ai/), Google Gemini, and [MCP](https://modelcontextprotocol.io/).

## Architecture

```
Slack → shadow-me (Linear, MCP, …) → Linear → Cursor
```

- **Slack**: Create or delegate tasks via chat
- **shadow-me**: AI agent that orchestrates tools (Linear, MCP, etc.) and manages task state
- **Cursor**: Executes tasks assigned in Linear

## Features

- **Slack Integration**: Mention @shadow-me in Slack to interact with your AI agent
- **Thread-based Memory**: Conversations are scoped to Slack threads for context preservation
- **Streaming Responses**: See typing indicators while the agent processes your request
- **Tool Access**: shadow-me can use Linear, MCP servers, and other configured tools

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

## Slack Integration

shadow-me can be integrated with Slack to respond to mentions and execute tasks.

### Setup Steps

1. **Create a Slack App**: Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app

2. **Configure OAuth Scopes**: Add the following Bot Token Scopes under "OAuth & Permissions":
   - `app_mentions:read`
   - `channels:history`
   - `chat:write`
   - `im:history`

3. **Install App to Workspace**: Click "Install to Workspace" and authorize the app

4. **Add Environment Variables**: Copy the Bot Token and Signing Secret to your `.env`:
   ```
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_SIGNING_SECRET=...
   ```

5. **Enable Event Subscriptions**: In your Slack App settings, enable Event Subscriptions and set the Request URL to:
   ```
   https://your-server.com/api/slack/events
   ```
   
   For local development, use [ngrok](https://ngrok.com/) to expose your local server:
   ```bash
   ngrok http 4111
   ```
   
   Then use the ngrok URL: `https://your-ngrok-url.ngrok.io/api/slack/events`

6. **Subscribe to Events**: Add the following bot events:
   - `app_mention`
   - `message.im`

7. **Restart the server**: After configuring, restart your Mastra server

Now you can mention @shadow-me in Slack channels or send direct messages to interact with your AI agent!
