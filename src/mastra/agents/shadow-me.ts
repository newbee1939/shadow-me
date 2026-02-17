import { Agent } from "@mastra/core/agent";
import { mcpClient } from "../mcp";

export const shadowMeAgent = new Agent({
  id: "shadow-me",
  name: "Shadow Me",
  instructions:
    "You are my digital twin. Act on my behalf using available tools. Always confirm before destructive operations.",
  model: [
    {
      model: "google/gemini-1.5-flash-8b",
      maxRetries: 3,
    },
    {
      model: "anthropic/claude-3-haiku-20240307",
      maxRetries: 2,
    },
  ],
  tools: await mcpClient.listTools(),
});
