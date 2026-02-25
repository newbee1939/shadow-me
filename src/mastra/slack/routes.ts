/**
 * Slack Event Subscriptions endpoint for shadow-me agent.
 * Request URL: https://<your-host>/slack/shadow-me/events
 */

import * as crypto from "node:crypto";
import { registerApiRoute } from "@mastra/core/server";
import { WebClient } from "@slack/web-api";

const BOT_TOKEN = process.env.SLACK_SHADOW_ME_BOT_TOKEN ?? "";
const SIGNING_SECRET = process.env.SLACK_SHADOW_ME_SIGNING_SECRET ?? "";

function verifySlackRequest(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  if (parseInt(timestamp, 10) < fiveMinutesAgo) return false;

  const expected =
    "v0=" +
    crypto
      .createHmac("sha256", signingSecret)
      .update(`v0:${timestamp}:${body}`, "utf8")
      .digest("hex");

  if (
    Buffer.byteLength(signature, "utf8") !== Buffer.byteLength(expected, "utf8")
  ) {
    return false;
  }
  return crypto.timingSafeEqual(
    Buffer.from(expected, "utf8"),
    Buffer.from(signature, "utf8"),
  );
}

export const slackRoutes = [
  registerApiRoute("/slack/shadow-me/events", {
    method: "POST",
    handler: async (c) => {
      const body = await c.req.text();
      const payload = JSON.parse(body);

      if (payload.type === "url_verification") {
        return c.json({ challenge: payload.challenge });
      }

      const signature = c.req.header("x-slack-signature");
      const timestamp = c.req.header("x-slack-request-timestamp");
      if (
        !signature ||
        !timestamp ||
        !verifySlackRequest(SIGNING_SECRET, signature, timestamp, body)
      ) {
        return c.json({ error: "Unauthorized" }, 401);
      }

      const event = payload.event;
      if (!event || event.bot_id || event.subtype) return c.json({ ok: true });
      if (event.type !== "app_mention" && event.type !== "message")
        return c.json({ ok: true });

      const message = (event.text ?? "").replace(/<@[A-Z0-9]+>/g, "").trim();
      const slackClient = new WebClient(BOT_TOKEN);
      const mastra = c.get("mastra");

      (async () => {
        try {
          const agent = mastra.getAgent("shadowMeAgent");
          const stream = await agent.stream(message, {
            memory: {
              resource: `slack-${payload.team_id}-${event.user}`,
              thread: `slack-${event.channel}-${event.thread_ts ?? event.ts}`,
            },
          });

          let text = "";
          for await (const chunk of stream.fullStream) {
            if (chunk.type === "text-delta") text += chunk.payload.text ?? "";
          }

          await slackClient.chat.postMessage({
            channel: event.channel,
            thread_ts: event.thread_ts ?? event.ts,
            text: text || "Sorry, I couldn't generate a response.",
          });
        } catch (error) {
          console.error("Slack event error:", error);
          await slackClient.chat
            .postMessage({
              channel: event.channel,
              thread_ts: event.thread_ts ?? event.ts,
              text: `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
            })
            .catch(() => {});
        }
      })();

      return c.json({ ok: true });
    },
  }),
];
