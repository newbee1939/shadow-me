import { WebClient } from "@slack/web-api";
import type { Agent } from "@mastra/core/agent";
import type { SlackEvent, SlackConfig } from "./types";
import { verifySlackRequest } from "./verify";

export class SlackHandler {
  private client: WebClient;
  private agent: Agent;
  private signingSecret: string;

  constructor(config: SlackConfig, agent: Agent) {
    this.client = new WebClient(config.botToken);
    this.agent = agent;
    this.signingSecret = config.signingSecret;
  }

  async handleEvent(
    event: SlackEvent,
    headers: Record<string, string>,
    body: string,
  ): Promise<{ status: number; body?: Record<string, unknown> }> {
    if (!verifySlackRequest(this.signingSecret, headers, body)) {
      return { status: 401, body: { error: "Invalid signature" } };
    }

    if (event.challenge) {
      return { status: 200, body: { challenge: event.challenge } };
    }

    if (event.type === "event_callback" && event.event) {
      const slackEvent = event.event;

      if (slackEvent.type === "app_mention" || slackEvent.type === "message") {
        await this.handleMessage(slackEvent);
      }
    }

    return { status: 200 };
  }

  private async handleMessage(event: {
    user: string;
    text: string;
    channel: string;
    ts: string;
    thread_ts?: string;
  }) {
    const threadTs = event.thread_ts || event.ts;
    const channel = event.channel;

    try {
      await this.client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: "考え中...",
      });

      const cleanedText = event.text.replace(/<@[A-Z0-9]+>/g, "").trim();

      const stream = await this.agent.stream({
        messages: [{ role: "user", content: cleanedText }],
        threadId: `slack-${channel}-${threadTs}`,
      });

      let fullResponse = "";
      let lastUpdate = Date.now();
      const updateInterval = 2000;

      for await (const chunk of stream) {
        if (chunk.type === "text") {
          fullResponse += chunk.text;

          const now = Date.now();
          if (now - lastUpdate > updateInterval) {
            await this.client.chat.postMessage({
              channel,
              thread_ts: threadTs,
              text: fullResponse,
            });
            lastUpdate = now;
          }
        }
      }

      if (fullResponse) {
        await this.client.chat.postMessage({
          channel,
          thread_ts: threadTs,
          text: fullResponse,
        });
      }
    } catch (error) {
      console.error("Error handling Slack message:", error);
      await this.client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: `エラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`,
      });
    }
  }
}
