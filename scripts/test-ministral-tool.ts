
import { ollama } from "ai-sdk-ollama";
import { generateText, tool } from "ai";
import { z } from "zod";

async function main() {
    console.log("🚀 Testing MINISTRAL with a simple tool...");

    try {
        const tools = {
            listProjects: tool({
                description: "List all available Neon projects",
                parameters: z.object({}),
                execute: async () => {
                    console.log("[TOOL CALLED] listProjects");
                    return JSON.stringify([
                        { id: "proj-123", name: "mts-facturation" },
                        { id: "proj-456", name: "my-app" }
                    ]);
                },
            }),
        };

        console.log("Sending request to ministral-3:3b with tool...");
        const startTime = Date.now();
        const { text, toolCalls, steps } = await generateText({
            model: ollama("ministral-3:3b"),
            tools,
            system: "You are a database assistant. When asked about projects, ALWAYS call listProjects tool first.",
            prompt: "What projects are available?",
        });
        const duration = (Date.now() - startTime) / 1000;

        console.log(`\n--- Response (${duration.toFixed(1)}s) ---`);
        console.log("Text:", text);
        console.log("Tool Calls:", JSON.stringify(toolCalls, null, 2));
        console.log("Steps Taken:", steps.length);

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main();
