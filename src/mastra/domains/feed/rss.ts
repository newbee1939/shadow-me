import type Parser from "rss-parser";
import { parseDate } from "../../utils/date";

type Article = {
  title: string;
  link: string;
  snippet: string;
  date?: string;
};

export type ParseFeed = (
  url: string,
) => Promise<Pick<Parser.Output<Parser.Item>, "items">>;

/** Max length of snippet when derived from content (no contentSnippet). */
export const SNIPPET_MAX_LENGTH = 300;

/**
 * Fetches RSS feeds and returns articles published on or after cutoffTime (ms).
 * Failed feeds are skipped; their items are omitted from the result.
 */
export async function fetchRecentArticles(
  feedUrls: string[],
  cutoffTime: number,
  parseURL: ParseFeed,
  onFetchError?: (url: string, reason: unknown) => void,
): Promise<Article[]> {
  const feedResults = await Promise.allSettled(
    feedUrls.map((url) => parseURL(url)),
  );

  return feedResults.flatMap((result, index) => {
    if (result.status === "rejected") {
      onFetchError?.(feedUrls[index], result.reason);
      return [];
    }

    return result.value.items
      .filter((item) => {
        const pubDate = parseDate(item.pubDate);
        return pubDate !== null && pubDate >= cutoffTime;
      })
      .map((item) => ({
        title: item.title ?? "",
        link: item.link ?? "",
        snippet:
          item.contentSnippet ??
          item.content?.slice(0, SNIPPET_MAX_LENGTH) ??
          "",
        date: item.pubDate ?? undefined,
      }));
  });
}
