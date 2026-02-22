import { MCPClient } from "@mastra/mcp";
import { describe, expect, it, vi } from "vitest";
import { createMcpClient } from "./index";

vi.mock("@mastra/mcp", () => ({
  MCPClient: vi.fn(),
}));

describe("createMcpClient", () => {
  it("creates client with selected servers and default id from sorted keys", () => {
    createMcpClient(["linear", "playwright"]);

    expect(MCPClient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "mcp-linear-playwright",
        servers: expect.objectContaining({
          linear: expect.any(Object),
          playwright: expect.any(Object),
        }),
      }),
    );
    expect(MCPClient).toHaveBeenCalledWith(
      expect.objectContaining({
        servers: expect.not.objectContaining({
          github: expect.anything(),
        }),
      }),
    );
  });

  it("uses options.id and options.timeout when provided", () => {
    createMcpClient(["playwright"], { id: "custom-id", timeout: 5_000 });

    expect(MCPClient).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "custom-id",
        timeout: 5_000,
      }),
    );
  });

  it("ignores unknown keys and only includes defined servers", () => {
    createMcpClient(["playwright", "unknown"] as Parameters<
      typeof createMcpClient
    >[0]);

    expect(MCPClient).toHaveBeenCalledWith(
      expect.objectContaining({
        servers: { playwright: expect.any(Object) },
      }),
    );
    expect(MCPClient).toHaveBeenCalledWith(
      expect.objectContaining({
        servers: expect.not.objectContaining({
          unknown: expect.anything(),
        }),
      }),
    );
  });
});
