import { describe, expect, it, vi } from "vitest";
import type { ParseFeed } from "./rss";
import { fetchRecentArticles, SNIPPET_MAX_LENGTH } from "./rss";

describe("fetchRecentArticles", () => {
  const cutoffTime = new Date("2024-06-14T00:00:00.000Z").getTime();

  it("returns articles from all feeds that are on or after cutoff time", async () => {
    const parseURL: ParseFeed = vi.fn((url: string) => {
      if (url === "https://feed1.example.com")
        return Promise.resolve({
          items: [
            {
              title: "Article 1",
              link: "https://example.com/1",
              pubDate: "2024-06-15T10:00:00.000Z",
              contentSnippet: "Snippet 1",
            },
            {
              title: "Old Article",
              link: "https://example.com/old",
              pubDate: "2024-06-13T00:00:00.000Z",
              contentSnippet: "Old",
            },
          ],
        });
      if (url === "https://feed2.example.com")
        return Promise.resolve({
          items: [
            {
              title: "Article 2",
              link: "https://example.com/2",
              pubDate: "2024-06-14T12:00:00.000Z",
              content: "Long content here",
            },
          ],
        });
      return Promise.resolve({ items: [] });
    });

    const articles = await fetchRecentArticles(
      ["https://feed1.example.com", "https://feed2.example.com"],
      cutoffTime,
      parseURL,
    );

    expect(articles).toHaveLength(2);
    expect(articles[0]).toEqual({
      title: "Article 1",
      link: "https://example.com/1",
      snippet: "Snippet 1",
      date: "2024-06-15T10:00:00.000Z",
    });
    expect(articles[1]).toEqual({
      title: "Article 2",
      link: "https://example.com/2",
      snippet: "Long content here",
      date: "2024-06-14T12:00:00.000Z",
    });
    expect(articles[1].snippet).toBe("Long content here"); // content used when contentSnippet missing, not sliced here (under 300)
  });

  it("filters out items before cutoff time", async () => {
    const parseURL: ParseFeed = vi.fn(() =>
      Promise.resolve({
        items: [
          {
            title: "Old",
            link: "https://example.com/old",
            pubDate: "2024-06-13T23:59:59.000Z",
          },
        ],
      }),
    );

    const articles = await fetchRecentArticles(
      ["https://feed.example.com"],
      cutoffTime,
      parseURL,
    );

    expect(articles).toHaveLength(0);
  });

  it("skips failed feeds and calls onFetchError", async () => {
    const onFetchError = vi.fn();
    const parseURL: ParseFeed = vi.fn((url: string) => {
      if (url === "https://fail.example.com")
        return Promise.reject(new Error("Network error"));
      return Promise.resolve({
        items: [
          {
            title: "Only",
            link: "https://example.com/only",
            pubDate: "2024-06-15T00:00:00.000Z",
          },
        ],
      });
    });

    const articles = await fetchRecentArticles(
      ["https://fail.example.com", "https://ok.example.com"],
      cutoffTime,
      parseURL,
      onFetchError,
    );

    expect(articles).toHaveLength(1);
    expect(articles[0].title).toBe("Only");
    expect(onFetchError).toHaveBeenCalledTimes(1);
    expect(onFetchError).toHaveBeenCalledWith(
      "https://fail.example.com",
      expect.any(Error),
    );
  });

  it("uses empty string for missing title/link/snippet", async () => {
    const parseURL: ParseFeed = vi.fn(() =>
      Promise.resolve({
        items: [
          {
            pubDate: "2024-06-15T00:00:00.000Z",
          },
        ],
      }),
    );

    const articles = await fetchRecentArticles(
      ["https://feed.example.com"],
      cutoffTime,
      parseURL,
    );

    expect(articles).toHaveLength(1);
    expect(articles[0]).toEqual({
      title: "",
      link: "",
      snippet: "",
      date: "2024-06-15T00:00:00.000Z",
    });
  });

  it("slices content to SNIPPET_MAX_LENGTH when contentSnippet is missing", async () => {
    const longContent = "a".repeat(SNIPPET_MAX_LENGTH + 100);
    const parseURL: ParseFeed = vi.fn(() =>
      Promise.resolve({
        items: [
          {
            title: "T",
            link: "https://example.com",
            pubDate: "2024-06-15T00:00:00.000Z",
            content: longContent,
          },
        ],
      }),
    );

    const articles = await fetchRecentArticles(
      ["https://feed.example.com"],
      cutoffTime,
      parseURL,
    );

    expect(articles[0].snippet).toHaveLength(SNIPPET_MAX_LENGTH);
    expect(articles[0].snippet).toBe("a".repeat(SNIPPET_MAX_LENGTH));
  });
});
