/**
 * Test script for the new Neon tools with ministral-3:3b
 */
import { ollama } from "ai-sdk-ollama";
import { generateText, stepCountIs } from "ai";
import { createNeonMCPClient } from "../lib/mcp";
import { createNeonTools } from "../lib/tools";

async function main() {
    console.log("🚀 Testing Ministral with Neon Tools...\n");

    try {
        // Create MCP client
        const mcpClient = await createNeonMCPClient();
        console.log("✅ MCP client created\n");

        // Create tools bound to MCP client
        const tools = createNeonTools(mcpClient);
        console.log(`✅ Created ${Object.keys(tools).length} tools: ${Object.keys(tools).join(', ')}\n`);

        // Test the model with our tools
        console.log("Sending request to ministral-3:3b...\n");
        const startTime = Date.now();

        const { text, toolCalls, steps } = await generateText({
            model: ollama("ministral-3:3b"),
            tools,
            system: `You are a database assistant. ALWAYS use tools to answer questions.
Call listProjects FIRST to get project IDs, then use those IDs for other tools.`,
            prompt: "List all my Neon projects",
            stopWhen: stepCountIs(3),
        });

        const duration = (Date.now() - startTime) / 1000;

        console.log(`\n--- Response (${duration.toFixed(1)}s) ---`);
        console.log("Text:", text);
        console.log("\nTool Calls:", JSON.stringify(toolCalls, null, 2));
        console.log("Steps:", steps.length);

        // Print step details
        steps.forEach((step, i) => {
            console.log(`\n--- Step ${i + 1} ---`);
            if (step.toolCalls) {
                step.toolCalls.forEach(tc => {
                    console.log(`Tool: ${tc.toolName}`);
                    console.log(`Args: ${JSON.stringify(tc.args)}`);
                });
            }
            if (step.toolResults) {
                step.toolResults.forEach(tr => {
                    console.log(`Result: ${JSON.stringify(tr.result).substring(0, 200)}...`);
                });
            }
        });

        await mcpClient.close();
        console.log("\n✅ Test complete!");

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main();
