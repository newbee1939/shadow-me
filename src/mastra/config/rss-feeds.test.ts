import { describe, expect, it } from "vitest";
import { getFeedUrls, RSS_FEEDS } from "./rss-feeds";

describe("rss-feeds", () => {
  describe("getFeedUrls", () => {
    it("returns all URLs when called with no args", () => {
      const urls = getFeedUrls();
      expect(urls).toHaveLength(Object.keys(RSS_FEEDS).length);
      expect(urls).toContain(RSS_FEEDS.hackernews);
    });

    it("returns all URLs when called with empty array", () => {
      const urls = getFeedUrls([]);
      expect(urls).toHaveLength(Object.keys(RSS_FEEDS).length);
    });

    it("returns only URLs for specified keys", () => {
      const urls = getFeedUrls(["hackernews", "qiita"]);
      expect(urls).toHaveLength(2);
      expect(urls).toContain(RSS_FEEDS.hackernews);
      expect(urls).toContain(RSS_FEEDS.qiita);
    });

    it("ignores unknown keys", () => {
      const urls = getFeedUrls(["hackernews", "unknown_media", "qiita"]);
      expect(urls).toHaveLength(2);
      expect(urls).toContain(RSS_FEEDS.hackernews);
      expect(urls).toContain(RSS_FEEDS.qiita);
    });

    it("returns empty array when all keys are unknown", () => {
      const urls = getFeedUrls(["unknown1", "unknown2"]);
      expect(urls).toHaveLength(0);
    });
  });
});
