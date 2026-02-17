import { MCPClient } from "@mastra/mcp";

const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

if (!githubToken) {
  throw new Error(
    "GITHUB_PERSONAL_ACCESS_TOKEN environment variable must be set.",
  );
}

export const mcpClient = new MCPClient({
  id: "mcp-client",
  servers: {
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
      },
    },
    playwright: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
  },
});
