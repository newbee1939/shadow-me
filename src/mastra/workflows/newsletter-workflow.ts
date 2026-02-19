import { createStep, createWorkflow } from "@mastra/core/workflows";
import Parser from "rss-parser";
import { z } from "zod";
import { shadowMeAgent } from "../agents/shadow-me.js";
import { DEFAULT_FEED_URLS } from "../config/newsletter-feeds.js";

const parser = new Parser();

const fetchRssStep = createStep({
  id: "fetch-rss",
  description: "Fetch latest items from multiple RSS feed URLs.",
  inputSchema: z.object({
    feedUrls: z.array(z.string().url()).min(1).max(20).optional(),
  }),
  outputSchema: z.object({
    prompt: z.string(),
  }),
  execute: async ({ inputData }) => {
    const feedUrls = inputData?.feedUrls ?? DEFAULT_FEED_URLS;
    const items: Array<{
      title: string;
      link: string;
      snippet: string;
      date?: string;
    }> = [];
    for (const url of feedUrls) {
      try {
        const feed = await parser.parseURL(url);
        for (const item of feed.items.slice(0, 10)) {
          items.push({
            title: item.title ?? "",
            link: item.link ?? "",
            snippet: item.contentSnippet ?? item.content?.slice(0, 200) ?? "",
            date: item.pubDate ?? undefined,
          });
        }
      } catch (e) {
        console.warn(`RSS fetch failed for ${url}:`, e);
      }
    }
    const prompt = items
      .map(
        (i, idx) =>
          `[${idx + 1}] ${i.title}\n   URL: ${i.link}\n   Snippet: ${i.snippet}${i.date ? `\n   Date: ${i.date}` : ""}`,
      )
      .join("\n\n");
    return {
      prompt: `Pick important news from the RSS feed list below and create a newsletter with explanations in the following format: headings, summaries, explanations, and links.

**REQUIRED TASK**: Before creating the newsletter, you **MUST** access each article URL and fetch the full content.

**Steps**:
1. Use the browser_navigate tool to access each article URL (e.g., browser_navigate({ url: "article URL" }))
2. Wait a moment for the page to load
3. Use the browser_snapshot tool to get the page's accessibility tree
4. Extract the article body text from the snapshot
5. After reviewing the full content, extract important information and compile it into the newsletter

RSS snippets alone are insufficient. You MUST access each article URL and read the full content. Do NOT create the newsletter without using the tools.

## News List\n\n${prompt}`,
    };
  },
});

const newsletterStep = createStep(shadowMeAgent, {
  structuredOutput: {
    schema: z.object({
      newsletter: z
        .string()
        .describe("Newsletter content with explanations (Markdown format)"),
    }),
  },
});

export const newsletterWorkflow = createWorkflow({
  id: "newsletter-workflow",
  description:
    "Fetches latest news from multiple RSS feeds, picks important ones, and outputs a newsletter with explanations.",
  inputSchema: z.object({
    feedUrls: z.array(z.string().url()).min(1).max(20).optional(),
  }),
  outputSchema: z.object({
    newsletter: z.string(),
  }),
})
  .then(fetchRssStep)
  .then(newsletterStep)
  .commit();
