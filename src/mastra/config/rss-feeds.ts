/** Mapping of media keys to RSS feed URLs */
export const RSS_FEEDS: Record<string, string> = {
  // Hacker News
  hackernews: "https://hnrss.org/frontpage",
  // はてなブックマーク テクノロジー
  hatena_it: "https://b.hatena.ne.jp/hotentry/it.rss",
  // はてなブックマーク 総合
  hatena_all: "https://b.hatena.ne.jp/hotentry/all.rss",
  // Publickey
  publickey: "https://www.publickey1.jp/atom.xml",
  // Qiita
  qiita: "https://qiita.com/popular-items/feed",
  // Zenn
  zenn: "https://zenn.dev/feed",
  // ITmedia
  itmedia: "https://rss.itmedia.co.jp/rss/2.0/topstory.xml",
  // Gigazine
  gigazine: "https://gigazine.net/news/rss_2.0/",
  // ZDNET
  zdnet: "https://www.zdnet.com/news/rss.xml",
  // coliss（コリス）
  coliss: "https://coliss.com/feed/",
  // Product Hunt
  producthunt: "https://www.producthunt.com/feed",
  // Dev.to
  devto: "https://dev.to/feed/",
  // HACKERNOON
  hackernoon: "https://hackernoon.com/feed",
  // @IT
  ait: "https://rss.itmedia.co.jp/rss/2.0/ait.xml",
  // GIZMODO
  gizmodo: "https://www.gizmodo.jp/index.xml",
  // TechCrunch
  techcrunch: "https://techcrunch.com/feed/",
  // Workship
  workship: "https://goworkship.com/magazine/feed/",
  // デイリーポータルZ
  dailyportalz: "https://dailyportalz.jp/feed/headline",
  // はてなブックマーク 暮らし
  hatena_life: "https://b.hatena.ne.jp/hotentry/life.rss",
  // SRE Weekly
  sreweekly: "https://sreweekly.com/feed/",
  // Findy
  findy: "https://api.findy-code.io/rss/media/recent",
  // レバテック
  levtech: "https://levtech.jp/media/feed/",
  // note
  note: "https://note.com/notemagazine/m/mf2e92ffd6658/rss",
  // Google Cloud Release Notes
  gcp_release_notes:
    "https://docs.cloud.google.com/feeds/gcp-release-notes.xml",
  // はてなブックマーク SRE
  hatena_sre:
    "https://b.hatena.ne.jp/q/sre?date_range=5y&sort=recent&target=all&users=3&mode=rss",
};

/**
 * Returns RSS feed URLs for the given media keys.
 * If keys is omitted or empty, returns all feed URLs. Unknown keys are ignored.
 */
export function getFeedUrls(keys?: string[]): string[] {
  if (!keys || keys.length === 0) {
    return Object.values(RSS_FEEDS);
  }
  return keys.filter((key) => key in RSS_FEEDS).map((key) => RSS_FEEDS[key]);
}
