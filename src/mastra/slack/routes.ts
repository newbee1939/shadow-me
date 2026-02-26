/**
 * Slack Event Subscriptions endpoint for shadow-me agent.
 * Request URL: https://<your-host>/slack/shadow-me/events
 */

import { registerApiRoute } from "@mastra/core/server";
import { WebClient } from "@slack/web-api";
import { createPrompt } from "./prompt.js";
import { verifySlackRequest } from "./verify.js";

const BOT_TOKEN = process.env.SLACK_SHADOW_ME_BOT_TOKEN ?? "";
const SIGNING_SECRET = process.env.SLACK_SHADOW_ME_SIGNING_SECRET ?? "";

export const slackRoutes = [
  registerApiRoute("/slack/shadow-me/events", {
    method: "POST",
    handler: async (c) => {
      const body = await c.req.text();
      const payload = JSON.parse(body);

      // url_verification is a request to verify the URL of the Slack app
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

          const prompt = await createPrompt(
            slackClient,
            event.channel,
            event.thread_ts,
            event.ts,
            message,
          );

          const agentMessage = await agent.generate(prompt);

          const { text } = agentMessage;

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
