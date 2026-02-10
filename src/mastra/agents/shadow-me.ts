import { Agent } from "@mastra/core/agent";
import { mcpClient } from "../mcp";

export const shadowMeAgent = new Agent({
  id: "shadow-me",
  name: "Shadow Me",
  instructions:
    "You are my digital twin. Act on my behalf using available tools. Always confirm before destructive operations.",
  model: "google/gemini-2.5-pro",
  tools: await mcpClient.listTools(),
});
