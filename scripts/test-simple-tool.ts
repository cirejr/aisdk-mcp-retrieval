
import { ollama } from "ai-sdk-ollama";
import { generateText, tool } from "ai";
import { z } from "zod";

async function main() {
    console.log("🚀 Testing Tool Calling with a SIMPLE tool...");

    try {
        const tools = {
            getCurrentWeather: tool({
                description: "Get the current weather for a location",
                parameters: z.object({
                    location: z.string().describe("The location to get weather for"),
                }),
                execute: async ({ location }) => {
                    console.log(`[TOOL CALLED] Getting weather for: ${location}`);
                    return `The weather in ${location} is sunny and 72°F.`;
                },
            }),
        };

        console.log("Sending request to model with simple tool...");
        const { text, toolCalls, steps } = await generateText({
            model: ollama("functiongemma"),
            tools,
            prompt: "What is the weather in San Francisco?",
        });

        console.log("\n--- Response ---");
        console.log("Text:", text);
        console.log("Tool Calls:", JSON.stringify(toolCalls, null, 2));
        console.log("Steps Taken:", steps.length);

    } catch (error) {
        console.error("❌ Test failed:", error);
    }
}

main();
