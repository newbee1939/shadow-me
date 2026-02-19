import { Agent } from "@mastra/core/agent";

export const newsletterAgent = new Agent({
  id: "newsletter-agent",
  name: "Newsletter Agent",
  instructions: `You are an editor that creates a concise newsletter.
Given a list of news items, pick the most important ones and write a short newsletter with:
- Clear section headings
- Brief summary for each item
- One or two sentence explanation/comment
- Source link for each item
Output in Markdown. Be concise and informative.`,
  model: [
    { model: "openai/gpt-5-nano", maxRetries: 2 },
    { model: "google/gemini-1.5-flash-8b", maxRetries: 2 },
  ],
});
