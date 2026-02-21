import { MCPClient } from "@mastra/mcp";

const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

export const mcpClient = new MCPClient({
  id: "mcp-client",
  servers: {
    ...(githubToken && {
      github: {
        command: "npx",
        args: ["-y", "@modelcontextprotocol/server-github"],
        env: {
          GITHUB_PERSONAL_ACCESS_TOKEN: githubToken,
        },
      },
    }),
    playwright: {
      command: "npx",
      args: ["@playwright/mcp@latest"],
    },
    linear: {
      command: "npx",
      args: ["-y", "mcp-remote", "https://mcp.linear.app/mcp"],
    },
  },
});
