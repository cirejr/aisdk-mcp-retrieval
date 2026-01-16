/**
 * Verification script for Neon MCP connection.
 * Tests that the MCP client can connect and list available tools.
 *
 * Run with: bun run scripts/verify-neon-mcp.ts
 *
 * Note: Requires NEON_API_KEY in .env.local or OAuth flow.
 */

import { createNeonMCPClient } from "../lib/mcp";

async function main() {
  console.log("🔍 Verifying Neon MCP connection...\n");

  try {
    const mcpClient = await createNeonMCPClient();
    console.log("✅ MCP client created successfully");

    const tools = await mcpClient.tools();
    const toolNames = Object.keys(tools);

    console.log(`\n📦 Available Neon MCP tools (${toolNames.length}):`);
    toolNames.forEach((name) => console.log(`   - ${name}`));

    await mcpClient.close();
    console.log("\n✅ Verification PASSED - Neon MCP is working!");
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Verification FAILED:", error);
    console.log("\n💡 Tips:");
    console.log("   1. Set NEON_API_KEY in .env.local");
    console.log("   2. Or use OAuth flow by running `bun dev` and accessing the app");
    process.exit(1);
  }
}

main();
