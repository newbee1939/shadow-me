import { createStep, createWorkflow } from "@mastra/core/workflows";
import Parser from "rss-parser";
import { z } from "zod";
import { newsletterAgent } from "../agents/newsletter-agent";

const parser = new Parser();

const fetchRssStep = createStep({
  id: "fetch-rss",
  description: "Fetch latest items from multiple RSS feed URLs.",
  inputSchema: z.object({
    feedUrls: z.array(z.string().url()).min(1).max(20),
  }),
  outputSchema: z.object({
    prompt: z.string(),
  }),
  execute: async ({ inputData }) => {
    const items: Array<{
      title: string;
      link: string;
      snippet: string;
      date?: string;
    }> = [];
    for (const url of inputData.feedUrls) {
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
          `[${idx + 1}] ${i.title}\n   URL: ${i.link}\n   概要: ${i.snippet}${i.date ? `\n   日付: ${i.date}` : ""}`,
      )
      .join("\n\n");
    return {
      prompt: `以下のRSSニュース一覧から重要なものをピックアップし、解説を交えたメルマガ形式（見出し・要約・解説・リンク）でまとめてください。\n\n## ニュース一覧\n\n${prompt}`,
    };
  },
});

const newsletterStep = createStep(newsletterAgent, {
  structuredOutput: {
    schema: z.object({
      newsletter: z.string().describe("解説付きメルマガ本文（Markdown可）"),
    }),
  },
});

export const newsletterWorkflow = createWorkflow({
  id: "newsletter-workflow",
  description:
    "Fetches latest news from multiple RSS feeds, picks important ones, and outputs a newsletter with explanations.",
  inputSchema: z.object({
    feedUrls: z.array(z.string().url()).min(1).max(20),
  }),
  outputSchema: z.object({
    newsletter: z.string(),
  }),
})
  .then(fetchRssStep)
  .then(newsletterStep)
  .commit();
