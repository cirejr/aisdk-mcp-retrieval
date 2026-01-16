/**
 * Business queries test for mts-facturation project.
 * Run with: bun run scripts/test-business-queries.ts
 */

import { createNeonMCPClient } from "../lib/mcp";

async function parseResponse(result: unknown): Promise<unknown> {
  const content = (result as { content?: Array<{ text: string }> }).content;
  const text = content?.[0]?.text;
  if (text) {
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
  return result;
}

async function main() {
  console.log("🔍 Testing business queries against mts-facturation...\n");

  const mcpClient = await createNeonMCPClient();
  const tools = await mcpClient.tools();

  const projectId = "square-lab-05687185"; // mts-facturation

  try {
    // Query 1: Tables overview
    console.log("📋 Query 1: Tables in mts-facturation...");
    const tablesResult = await tools["run_sql"].execute({
      projectId,
      sql: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
    });
    const tables = await parseResponse(tablesResult);
    console.log("Tables:", JSON.stringify(tables, null, 2));

    // Query 2: Recent invoices
    console.log("\n📋 Query 2: Recent invoices summary...");
    const invoicesResult = await tools["run_sql"].execute({
      projectId,
      sql: `SELECT COUNT(*) as total_invoices FROM invoices`,
    });
    const invoices = await parseResponse(invoicesResult);
    console.log("Invoices count:", JSON.stringify(invoices, null, 2));

    // Query 3: Clients count
    console.log("\n📋 Query 3: Clients count...");
    const clientsResult = await tools["run_sql"].execute({
      projectId,
      sql: `SELECT COUNT(*) as total_clients FROM clients`,
    });
    const clients = await parseResponse(clientsResult);
    console.log("Clients count:", JSON.stringify(clients, null, 2));

    // Query 4: Payments summary
    console.log("\n📋 Query 4: Payments summary...");
    const paymentsResult = await tools["run_sql"].execute({
      projectId,
      sql: `SELECT COUNT(*) as total_payments FROM payments`,
    });
    const payments = await parseResponse(paymentsResult);
    console.log("Payments count:", JSON.stringify(payments, null, 2));

    await mcpClient.close();
    console.log("\n✅ All business queries completed successfully!");
  } catch (error) {
    console.error("\n❌ Error:", error);
    await mcpClient.close();
    process.exit(1);
  }
}

main();
