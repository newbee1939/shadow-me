/**
 * Slack Event Subscriptions endpoint for shadow-me agent.
 * Request URL: https://<your-host>/slack/shadow-me/events
 */
import { registerApiRoute } from "@mastra/core/server";
import { WebClient } from "@slack/web-api";
import { streamToSlack } from "./streaming";
import { verifySlackRequest } from "./verify";

const BOT_TOKEN = process.env.SLACK_SHADOW_ME_BOT_TOKEN ?? "";
const SIGNING_SECRET = process.env.SLACK_SHADOW_ME_SIGNING_SECRET ?? "";

export const slackRoutes = [
  registerApiRoute("/slack/shadow-me/events", {
    method: "POST",
    requiresAuth: false,
    handler: async (c) => {
      try {
        const body = await c.req.text();
        const payload = JSON.parse(body);

        if (payload.type === "url_verification") {
          return c.json({ challenge: payload.challenge });
        }

        if (!BOT_TOKEN || !SIGNING_SECRET) {
          return c.json({ error: "Server misconfigured" }, 500);
        }

        const slackSignature = c.req.header("x-slack-signature");
        const slackTimestamp = c.req.header("x-slack-request-timestamp");
        if (!slackSignature || !slackTimestamp) {
          return c.json({ error: "Missing Slack signature headers" }, 401);
        }

        if (
          !verifySlackRequest(
            SIGNING_SECRET,
            slackSignature,
            slackTimestamp,
            body,
          )
        ) {
          return c.json({ error: "Invalid signature" }, 401);
        }

        const event = payload.event;
        if (!event) {
          return c.json({ ok: true });
        }

        if (event.bot_id || event.subtype) {
          return c.json({ ok: true });
        }

        if (event.type !== "app_mention" && event.type !== "message") {
          return c.json({ ok: true });
        }

        const messageText = (event.text || "")
          .replace(/<@[A-Z0-9]+>/g, "")
          .trim();
        const mastra = c.get("mastra");
        const slackClient = new WebClient(BOT_TOKEN);

        (async () => {
          try {
            await streamToSlack({
              mastra,
              slackClient,
              channel: event.channel,
              threadTs: event.thread_ts || event.ts,
              agentName: "shadowMeAgent",
              message: messageText,
              resourceId: `slack-${payload.team_id}-${event.user}`,
              threadId: `slack-${event.channel}-${event.thread_ts || event.ts}`,
            });
          } catch (error) {
            console.error("Slack event error:", error);
          }
        })();

        return c.json({ ok: true });
      } catch (error) {
        console.error("Slack route error:", error);
        return c.json({ error: "Failed to handle event" }, 500);
      }
    },
  }),
];
