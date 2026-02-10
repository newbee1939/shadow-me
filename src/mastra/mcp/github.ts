import { MCPClient } from "@mastra/mcp";

export const githubMcpClient = new MCPClient({
  id: "github-mcp-client",
  servers: {
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN:
          process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? "",
      },
    },
  },
});
