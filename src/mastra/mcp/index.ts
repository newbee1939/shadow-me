import type { MastraMCPServerDefinition } from "@mastra/mcp";
import { MCPClient } from "@mastra/mcp";

/**
 * When using MCP tools with an LLM (e.g. OpenAI), the tool’s parameter schema is sent
 * to the LLM provider's API (e.g. OpenAI's API). OpenAI (and some other providers) require that every field in `properties`
 * is also listed in `required`. If an MCP server defines optional parameters (in
 * `properties` but not in `required`), the API can return:
 *
 *   Invalid schema for function '...': 'required' must include every key in properties. Missing '...'.
 *
 * Example REJECTED (filename in properties but not in required):
 *   { "properties": { "level": { "type": "string" }, "filename": { "type": "string" } }, "required": ["level"] }
 *
 * Example ACCEPTED (every key of properties is in required):
 *   { "properties": { "level": { "type": "string" }, "filename": { "type": "string" } }, "required": ["level", "filename"] }
 *
 * Fix: don’t attach that MCP server to agents that use that provider, or use a model
 * that accepts the schema.
 */

const githubToken = process.env.GITHUB_PERSONAL_ACCESS_TOKEN;

/** All available MCP server definitions. */
const ALL_MCP_SERVERS = {
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
    args: ["-y", "@playwright/mcp@latest"],
  },
  linear: {
    command: "npx",
    args: ["-y", "mcp-remote", "https://mcp.linear.app/mcp"],
  },
} satisfies Record<string, MastraMCPServerDefinition>;

/** Keys for createMcpClient. */
type McpServerKey = keyof typeof ALL_MCP_SERVERS;

/** Returns an MCPClient with only the given servers enabled. Use to limit each agent to the MCPs it needs. */
export function createMcpClient(
  keys: McpServerKey[],
  options?: { id?: string; timeout?: number },
): MCPClient {
  const servers = keys.reduce<Record<string, MastraMCPServerDefinition>>(
    (selectedServers, key) => {
      const config = ALL_MCP_SERVERS[key];
      if (config) {
        selectedServers[key] = config;
      }
      return selectedServers;
    },
    {},
  );

  return new MCPClient({
    id: options?.id ?? `mcp-${Object.keys(servers).sort().join("-")}`,
    servers,
    timeout: options?.timeout,
  });
}

/** Client with all MCPs enabled. */
export const mcpClient = createMcpClient(
  Object.keys(ALL_MCP_SERVERS) as McpServerKey[],
  { id: "mcp-client" },
);
