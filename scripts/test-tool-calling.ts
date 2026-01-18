
import { ollama } from "ai-sdk-ollama";
import { generateText, convertToModelMessages, stepCountIs } from "ai";
import { createNeonMCPClient } from "../lib/mcp";

async function main() {
    console.log("🚀 Testing Tool Calling with Ministral and Neon MCP...");

    try {
        const mcpClient = await createNeonMCPClient();
        console.log("✅ MCP client created.");
        console.log("Client keys:", Object.keys(mcpClient));

        const mcpTools = await mcpClient.tools(); // This might be 'listTools' or similar if it's the raw client
        // If mcpTools works, let's see what it returns
        console.log("Tools available:", Object.keys(mcpTools || {}));

        // Check list_projects schema if possible
        // The previous code did `await mcpClient.tools()`, assuming it returns a map of tools? 
        // Or maybe it returns { tools: [...] }?
        // Let's dump mcpTools to be sure.
        console.log("mcpTools dump:", JSON.stringify(mcpTools, null, 2));

        console.log("Client constructor:", mcpClient.constructor.name);

        const variations = [
            { name: "Object with arguments", args: [{ name: "list_projects", arguments: {} }] },
            { name: "Two args (name, object)", args: ["list_projects", {}] },
            { name: "Object with params wrapper", args: [{ name: "list_projects", params: { arguments: {} } }] },
            { name: "Two args (name, params wrapper)", args: ["list_projects", { params: { arguments: {} } }] },
            { name: "Original broken style", args: ["list_projects", { params: { name: "list_projects" } }] }
        ];

        for (const v of variations) {
            console.log(`\n--- Testing: ${v.name} ---`);
            try {
                const res = await (mcpClient as any).callTool(...v.args);
                console.log("✅ Success:", JSON.stringify(res, null, 2).substring(0, 500));
            } catch (e: any) {
                console.log("❌ Failed:", e.message || e);
                if (e.code) console.log("Code:", e.code);
                if (e.data) console.log("Data:", JSON.stringify(e.data));
            }
        }

        await mcpClient.close();
    } catch (error) {
        console.error("❌ Test failed:", error);
        if (error instanceof Error && 'code' in error) {
            console.error("Error Code:", (error as any).code);
            console.error("Error Data:", JSON.stringify((error as any).data, null, 2));
        }
    }
}

main();
