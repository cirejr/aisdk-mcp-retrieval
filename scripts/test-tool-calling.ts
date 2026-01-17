
import { ollama } from "ai-sdk-ollama";
import { generateText, convertToModelMessages, stepCountIs } from "ai";
import { createNeonMCPClient } from "../lib/mcp";

async function main() {
    console.log("🚀 Testing Tool Calling with Ministral and Neon MCP...");

    try {
        console.log("Sending text-only test request...");
        const textTest = await generateText({
            model: ollama("ministral-3:3b"),
            prompt: "Say hello!",
        });
        console.log("✅ Text-only test response:", textTest.text);

        const mcpClient = await createNeonMCPClient();
        console.log("✅ MCP client created.");

        const mcpTools = await mcpClient.tools();
        console.log(`✅ Fetched ${Object.keys(mcpTools).length} tools.`);

        // Filter tools for testing
        const tools = Object.fromEntries(
            Object.entries(mcpTools).filter(([name]) =>
                ['list_projects', 'get_database_tables', 'describe_table_schema', 'run_sql'].includes(name)
            )
        );
        console.log(`✅ Using filtered subset of ${Object.keys(tools).length} tools.`);

        console.log("Sending request to model...");
        const { text, toolCalls, steps } = await generateText({
            model: ollama("ministral-3:3b"),
            tools,
            system: `You are a database assistant. You MUST use tools to answer questions about databases.

AVAILABLE TOOLS:
- list_projects: List all Neon projects (use this FIRST to find project IDs)
- get_database_tables: List tables in a database
- describe_table_schema: Get schema of a table
- run_sql: Execute SQL queries

CRITICAL RULES:
1. ALWAYS call list_projects FIRST when user asks about databases
2. NEVER ask the user for project IDs - find them yourself using tools
3. Use tool results to make follow-up tool calls as needed`,
            prompt: "What tables are available in my database?",
            stopWhen: stepCountIs(5),
        });

        console.log("\n--- Response ---");
        console.log("Text:", text);
        console.log("Tool Calls:", JSON.stringify(toolCalls, null, 2));
        console.log("Steps Taken:", steps.length);

        await mcpClient.close();
    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main();
