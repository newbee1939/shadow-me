import { createTool } from "@mastra/core/tools";
import { z } from "zod";

/**
 * Fetches the given URL with GET and returns the response body as-is.
 * JavaScript is not executed (not suitable for SPAs or JS-dependent pages).
 */
export const fetchUrlTool = createTool({
  id: "fetch_url",
  description:
    "Fetch the content of a URL via HTTP GET. Returns the raw response body. Use to read article or page content. Does not execute JavaScript.",
  inputSchema: z.object({
    url: z
      .string()
      .describe("The URL to fetch (e.g. https://example.com/article)"),
  }),
  execute: async ({ url }) => {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mastra-Newsletter/1.0 (fetch)" },
      signal: AbortSignal.timeout(15_000),
    });
    if (!res.ok) {
      return { error: `HTTP ${res.status}`, url };
    }
    const content = await res.text();
    return { url, content };
  },
});
