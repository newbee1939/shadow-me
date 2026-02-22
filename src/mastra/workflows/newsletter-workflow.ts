import { createStep, createWorkflow } from "@mastra/core/workflows";
import Parser from "rss-parser";
import { z } from "zod";
import { newsletterAgent } from "../agents/newsletter-agent";
import { type FeedKey, getFeedUrls } from "../config/rss-feeds";
import { fetchRecentArticles } from "../domains/feed/rss";
import { get24HoursAgo } from "../utils/date";

const parser = new Parser();

const NEWSLETTER_FEED_KEYS: FeedKey[] | undefined = [
  "hackernews",
  "hatena_it",
  "qiita",
  "zenn",
  "publickey",
  "itmedia",
  "techcrunch",
  "sreweekly",
  "hatena_sre",
];

const fetchRssStep = createStep({
  id: "fetch-rss",
  description:
    "Fetch articles from RSS feeds published within the last 24 hours.",
  execute: async () => {
    const feedUrls = getFeedUrls(NEWSLETTER_FEED_KEYS);
    const cutoffTime = get24HoursAgo();
    const articles = await fetchRecentArticles(
      feedUrls,
      cutoffTime,
      (url) => parser.parseURL(url),
      (url, reason) => {
        console.warn(`RSS fetch failed for ${url}:`, reason);
      },
    );

    const articlesList = articles
      .map(
        (article, idx) =>
          `[${idx + 1}] ${article.title}\n   URL: ${article.link}\n   Snippet: ${article.snippet}${article.date ? `\n   Date: ${article.date}` : ""}`,
      )
      .join("\n\n");

    const prompt = `私はソフトウェア・エンジニアです。以下のRSSフィードから取得した記事（過去24時間以内）の中から、私にとって重要そうなニュースを10個くらいピックアップして、分かりやすい解説付きのメールマガジンを作成してください。

重要な記事については、必要に応じて fetch_url ツールで記事URLにアクセスし、本文を取得してから解説を書いてください。

メールマガジンの形式：
- 見出し
- 要約
- 解説
- リンク

## 記事一覧（${articles.length}件）

${articlesList}`;

    return { prompt };
  },
});

// Do not use structuredOutput: Gemini does not support "function calling" (i.e. tool use)
// and response format application/json (structured output) at the same time.
// This step uses newsletterAgent with the fetch_url tool, so we cannot request JSON output.
const newsletterStep = createStep(newsletterAgent);

const toNewsletterOutputStep = createStep({
  id: "to-newsletter-output",
  description: "Map agent text output to workflow output shape.",
  inputSchema: z.object({ text: z.string() }),
  outputSchema: z.object({ newsletter: z.string() }),
  execute: async ({ getStepResult }) => {
    const prev = getStepResult("newsletter") as { text: string };
    return { newsletter: prev.text };
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
  .then(toNewsletterOutputStep)
  .commit();
