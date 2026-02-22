import type { SlackConfig } from "./types";
import { SlackHandler } from "./handler";
import { mastra } from "../mastra";

const slackConfig: SlackConfig = {
  botToken: process.env.SLACK_BOT_TOKEN || "",
  signingSecret: process.env.SLACK_SIGNING_SECRET || "",
  agentId: "shadow-me",
};

const shadowMeSlackHandler = new SlackHandler(
  slackConfig,
  mastra.getAgent("shadowMeAgent"),
);

export async function handleSlackEvent(request: Request): Promise<Response> {
  const body = await request.text();
  const headers: Record<string, string> = {};

  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  try {
    const event = JSON.parse(body);
    const result = await shadowMeSlackHandler.handleEvent(event, headers, body);

    return new Response(JSON.stringify(result.body || {}), {
      status: result.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error handling Slack event:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
