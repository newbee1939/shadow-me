/**
 * Slack Event Subscriptions endpoint for shadow-me agent.
 * Request URL: https://<your-host>/slack/shadow-me/events
 */

import * as crypto from "node:crypto";
import { registerApiRoute } from "@mastra/core/server";
import { WebClient } from "@slack/web-api";

const BOT_TOKEN = process.env.SLACK_SHADOW_ME_BOT_TOKEN ?? "";
const SIGNING_SECRET = process.env.SLACK_SHADOW_ME_SIGNING_SECRET ?? "";

// reference: https://docs.slack.dev/authentication/verifying-requests-from-slack/
function verifySlackRequest(
  signingSecret: string,
  signature: string,
  timestamp: string,
  body: string,
): boolean {
  const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 60 * 5;
  // Reject requests older than 5 minutes to prevent replay attacks.
  // Even if an attacker captures a valid signed request, they cannot reuse it
  // after the 5-minute window has passed.
  if (parseInt(timestamp, 10) < fiveMinutesAgo) {
    return false;
  }

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
      if (!event || event.bot_id || event.subtype) {
        return c.json({ ok: true });
      }
      if (event.type !== "app_mention" && event.type !== "message") {
        return c.json({ ok: true });
      }

      const message = (event.text ?? "").replace(/<@[A-Z0-9]+>/g, "").trim();
      const slackClient = new WebClient(BOT_TOKEN);
      const mastra = c.get("mastra");

      // Fire-and-forget: Slack requires a response within 3 seconds or it will
      // retry the request. Since agent processing takes longer than that, we
      // kick off the work in the background without awaiting it, then immediately
      // return 200 OK below. Once done, the result is posted back via chat.postMessage.
      (async () => {
        try {
          const agent = mastra.getAgent("shadowMeAgent");

          // If this is inside a thread, fetch prior messages to provide context
          // for the first time the agent is mentioned in an existing thread.
          let prompt = message;
          const threadTs = event.thread_ts;
          if (threadTs) {
            const replies = await slackClient.conversations.replies({
              channel: event.channel,
              ts: threadTs,
            });
            const history = (replies.messages ?? [])
              .filter((m) => m.ts !== event.ts)
              .map((m) => {
                const author = m.bot_id ? "Agent" : "User";
                const text = (m.text ?? "").replace(/<@[A-Z0-9]+>/g, "").trim();
                return `${author}: ${text}`;
              })
              .join("\n");
            if (history) {
              prompt = `Previous thread messages:\n${history}\n\nUser: ${message}`;
            }
          }

          const result = await agent.generate(prompt, {
            memory: {
              resource: `slack-${payload.team_id}-${event.user}`,
              thread: `slack-${event.channel}-${event.thread_ts ?? event.ts}`,
            },
          });

          const text = result.text;

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
            .catch((postError) => {
              console.error(
                "Failed to send error message to Slack:",
                postError,
              );
            });
        }
      })();

      return c.json({ ok: true });
    },
  }),
];
