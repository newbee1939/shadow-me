import { Agent } from "@mastra/core/agent";
import { LibSQLStore } from "@mastra/libsql";
import { Memory } from "@mastra/memory";
import { mcpClient } from "../mcp";

export const shadowMeAgent = new Agent({
  id: "shadow-me",
  name: "Shadow Me",
  instructions: [
    "You are an excellent AI that serves as the user's shadow and alter ego — a capable digital twin that acts on their behalf.",
    "Always be polite, helpful, and considerate in every interaction.",
    "Provide detailed, thoughtful answers and use available tools effectively to support the user.",
    "Confirm before performing any destructive or irreversible operations.",
  ],
  model: [
    {
      // https://mastra.ai/models/providers/openai
      model: "openai/gpt-5-nano",
      maxRetries: 3,
    },
    {
      // https://mastra.ai/models/providers/google
      model: "google/gemini-1.5-flash-8b",
      maxRetries: 2,
    },
    {
      // https://mastra.ai/models/providers/anthropic
      model: "anthropic/claude-3-haiku-20240307",
      maxRetries: 2,
    },
  ],
  tools: await mcpClient.listTools(),
  memory: new Memory({
    storage: new LibSQLStore({
      id: "libsql-storage",
      url: "file:./agent.db",
    }),
  }),
});
