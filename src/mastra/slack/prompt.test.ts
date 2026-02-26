import type { WebClient } from "@slack/web-api";
import { describe, expect, it, vi } from "vitest";
import { createPrompt } from "./prompt.js";

function makeSlackClient(
  messages: { ts: string; user: string; text: string }[],
) {
  return {
    conversations: {
      replies: vi.fn().mockResolvedValue({ messages }),
    },
  } as unknown as WebClient;
}

describe("createPrompt", () => {
  const channel = "C123";
  const currentTs = "1000.0003";
  const message = "Hello";

  it("returns the message as-is when threadTs is undefined", async () => {
    const client = makeSlackClient([]);

    const result = await createPrompt(
      client,
      channel,
      undefined,
      currentTs,
      message,
    );

    expect(result).toBe(message);
    expect(client.conversations.replies).not.toHaveBeenCalled();
  });

  it("returns a prompt with thread history when prior messages exist", async () => {
    const threadTs = "1000.0001";
    const client = makeSlackClient([
      { ts: "1000.0001", user: "U001", text: "First message" },
      { ts: "1000.0002", user: "U002", text: "Second message" },
      { ts: currentTs, user: "U003", text: message },
    ]);

    const result = await createPrompt(
      client,
      channel,
      threadTs,
      currentTs,
      message,
    );

    expect(result).toBe(
      "Previous thread messages:\nU001: First message\nU002: Second message\n\nUser: Hello",
    );
  });

  it("returns the message as-is when the thread contains only the current message", async () => {
    const threadTs = "1000.0001";
    const client = makeSlackClient([
      { ts: currentTs, user: "U001", text: message },
    ]);

    const result = await createPrompt(
      client,
      channel,
      threadTs,
      currentTs,
      message,
    );

    expect(result).toBe(message);
  });
});
