import type { WebClient } from "@slack/web-api";

export async function createPrompt(
  slackClient: WebClient,
  channel: string,
  threadTs: string | undefined,
  currentTs: string,
  message: string,
): Promise<string> {
  if (!threadTs) {
    return message;
  }

  const replies = await slackClient.conversations.replies({
    channel,
    ts: threadTs,
  });
  const history = (replies.messages ?? [])
    // filter out the current message
    .filter((m) => m.ts !== currentTs)
    .map((m) => `${m.user}: ${m.text}`)
    .join("\n");

  return history
    ? `Previous thread messages:\n${history}\n\nUser: ${message}`
    : message;
}
