import { ollama } from "ai-sdk-ollama";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { createNeonMCPClient } from "@/lib/mcp";

export const maxDuration = 60;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();

	try {
		// Initialize Neon MCP client
		const mcpClient = await createNeonMCPClient();

		// Get tools from MCP server
		const tools = await mcpClient.tools();

		// Get available tool names for system prompt
		const toolNames = Object.keys(tools).join(", ");

		// Enhanced system prompt for better database interaction
		const systemPrompt = `You are a helpful AI assistant that can query a database using available tools.

Available database tools: ${toolNames}

When users ask questions about data:
1. Analyze their question to understand what data they need
2. Use the appropriate database tool to retrieve the information
3. Present the results in a clear, structured format
4. Explain what data was retrieved and provide context

Guidelines:
- Always use tools when users ask for data, reports, or information
- Be specific about what data you're retrieving
- Present results in readable tables or lists
- If no data is found, explain why and suggest alternatives
- For complex queries, break them into multiple tool calls
- Always show the tool results clearly to the user

Format your responses:
- Start with a brief summary of what you found
- Present the actual data in a structured format
- Add brief insights or context when relevant
- Offer to help with follow-up questions`;

		const result = streamText({
			model: ollama("ministal-3:3b"),
			messages: await convertToModelMessages(messages),
			tools,
			system: systemPrompt,
			temperature: 0.3, // Lower temperature for more deterministic tool usage
			stopWhen: stepCountIs(10), // Allow more multi-step tool calls
			maxSteps: 10,
			onFinish: async () => {
				// Always close MCP client when done
				try {
					await mcpClient.close();
				} catch (error) {
					console.error("Error closing MCP client:", error);
				}
			},
			onError: (error) => {
				console.error("Stream error:", error);
				return `Error: ${error.message}`;
			},
		});

		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Chat API error:", error);

		// Return error response
		return new Response(
			JSON.stringify({
				error: "Failed to process your request",
				details: error instanceof Error ? error.message : "Unknown error",
			}),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
