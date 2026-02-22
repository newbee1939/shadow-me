import { Agent } from "@mastra/core/agent";
import { createMcpClient } from "../mcp";

const newsletterMcp = createMcpClient(["playwright"], { id: "mcp-newsletter" });

export const newsletterAgent = new Agent({
  id: "newsletter",
  name: "Newsletter Agent",
  instructions: [
    "You create newsletter content from a list of RSS articles.",
    "Use Playwright browser tools (browser_navigate, browser_snapshot, etc.) when you need to open article URLs and read the actual content for better summaries.",
    "Output clear, well-structured Markdown: headings, summaries, explanations, and links.",
    "Be concise and accurate; do not make up content.",
  ],
  model: [
    {
      model: "openai/gpt-5.2",
      maxRetries: 3,
    },
  ],
  tools: await newsletterMcp.listTools(),
});
