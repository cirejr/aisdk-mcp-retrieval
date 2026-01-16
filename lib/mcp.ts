import { createMCPClient } from "@ai-sdk/mcp";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const NEON_MCP_URL = "https://mcp.neon.tech/mcp";

/**
 * Creates a Neon MCP client.
 * Uses API key auth if NEON_API_KEY is set, otherwise relies on OAuth flow.
 */
export async function createNeonMCPClient() {
  const apiKey = process.env.NEON_API_KEY;

  const transport = new StreamableHTTPClientTransport(new URL(NEON_MCP_URL), {
    requestInit: apiKey
      ? { headers: { Authorization: `Bearer ${apiKey}` } }
      : undefined,
  });

  const mcpClient = await createMCPClient({ transport });

  return mcpClient;
}
