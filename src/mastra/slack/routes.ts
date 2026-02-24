type SlackAppConfig = {
  name: string; // Route path: /slack/{name}/events
  botToken: string;
  signingSecret: string;
  agentName: string;
};

const slackApps: SlackAppConfig[] = [
  {
    name: "shadow-me-agent", // Route: /slack/shadow-me-agent/events
    botToken: process.env.SLACK_SHADOW_ME_BOT_TOKEN!,
    signingSecret: process.env.SLACK_SHADOW_ME_SIGNING_SECRET!,
    agentName: "shadow-me", // Must match key in mastra.agents
  },
];

// Generate routes for all configured apps
export const slackRoutes = slackApps.map(createSlackEventsRoute);
