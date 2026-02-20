import { createStep, createWorkflow } from "@mastra/core/workflows";
import Parser from "rss-parser";
import { z } from "zod";
import { shadowMeAgent } from "../agents/shadow-me";
import { RSS_FEED_URLS } from "../config/rss-feeds";

const parser = new Parser();

const get24HoursAgo = () => {
  const now = new Date();
  now.setHours(now.getHours() - 24);
  return now.getTime();
};

const parseDate = (dateStr: string | undefined): number | null => {
  if (!dateStr) {
    return null;
  }
  const date = new Date(dateStr);
  return Number.isNaN(date.getTime()) ? null : date.getTime();
};

const fetchRssStep = createStep({
  id: "fetch-rss",
  description:
    "Fetch articles from RSS feeds published within the last 24 hours.",
  execute: async () => {
    const feedUrls = RSS_FEED_URLS;
    const cutoffTime = get24HoursAgo();
    const articles: Array<{
      title: string;
      link: string;
      snippet: string;
      date?: string;
    }> = [];

    for (const url of feedUrls) {
      try {
        const feed = await parser.parseURL(url);
        for (const item of feed.items) {
          const pubDate = parseDate(item.pubDate);
          if (pubDate && pubDate >= cutoffTime) {
            articles.push({
              title: item.title ?? "",
              link: item.link ?? "",
              snippet: item.contentSnippet ?? item.content?.slice(0, 300) ?? "",
              date: item.pubDate ?? undefined,
            });
          }
        }
      } catch (e) {
        console.warn(`RSS fetch failed for ${url}:`, e);
      }
    }

    const articlesList = articles
      .map(
        (article, idx) =>
          `[${idx + 1}] ${article.title}\n   URL: ${article.link}\n   Snippet: ${article.snippet}${article.date ? `\n   Date: ${article.date}` : ""}`,
      )
      .join("\n\n");

    const prompt = `以下のRSSフィードから取得した記事（過去24時間以内）の中から、エンジニアにとって重要そうなニュースをピックアップして、解説付きのメールマガジンを作成してください。

重要な記事については、必要に応じてplaywrightのブラウザツール（browser_navigate、browser_snapshotなど）を使って実際のURLにアクセスし、記事の内容を確認してから解説を書いてください。

メールマガジンの形式：
- 見出し
- 要約
- 解説（なぜ重要か、エンジニアにとってどういう意味があるか）
- リンク

## 記事一覧（${articles.length}件）

${articlesList}`;

    return { prompt };
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
    "Fetches articles from RSS feeds published within the last 24 hours, picks important ones, and creates a newsletter with explanations.",
  inputSchema: z.object({}),
  outputSchema: z.object({
    newsletter: z.string(),
  }),
})
  .then(fetchRssStep)
  .then(newsletterStep)
  .commit();
