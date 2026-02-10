import { MCPClient } from "@mastra/mcp";

export const mcpClient = new MCPClient({
  id: "mcp-client",
  servers: {
    github: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-github"],
      env: {
        GITHUB_PERSONAL_ACCESS_TOKEN:
          process.env.GITHUB_PERSONAL_ACCESS_TOKEN ?? "",
      },
    },
    fetch: {
      command: "npx",
      args: ["-y", "@modelcontextprotocol/server-fetch"],
    },
  },
});
