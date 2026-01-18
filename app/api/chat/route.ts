import { ollama } from "ai-sdk-ollama";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { createNeonMCPClient } from "@/lib/mcp";
import { createNeonTools } from "@/lib/tools";

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	console.log("Received messages:", JSON.stringify(messages, null, 2));

	try {
		console.log("Creating Neon MCP client...");
		const mcpClient = await createNeonMCPClient();
		console.log("Neon MCP client created.");

		// Create tools with proper schemas bound to MCP client
		const tools = mcpClient.tools();
		console.log("Tools created:", JSON.stringify(tools, null, 2));

		const systemPrompt = `You are a database assistant. You MUST use tools to answer questions about databases.

AVAILABLE TOOLS:
- listProjects: List all Neon projects. Call this FIRST to get project IDs.
- getProjectTables: Get tables in a project (requires projectId)
- runQuery: Execute SQL on a project (requires projectId and query)
- describeTable: Get table schema (requires projectId and tableName)

WORKFLOW:
1. ALWAYS call listProjects FIRST to get available projects and their IDs
2. Use the projectId from step 1 for subsequent tool calls
3. NEVER ask the user for IDs - find them yourself

Example: User asks "show tables in mts-facturation"
→ Call listProjects → Find mts-facturation → Get its projectId → Call getProjectTables with that projectId`;
		const result = streamText({
			model: ollama("granite4:3b"),
			messages: await convertToModelMessages(messages),
			tools,
			system: systemPrompt,
			temperature: 0.1,
			stopWhen: stepCountIs(10),
			onFinish: async () => {
				console.log("Stream finished.");
				try {
					await mcpClient.close();
					console.log("MCP client closed.");
				} catch (error) {
					console.error("Error closing MCP client:", error);
				}
			},
			onError: (error) => {
				console.error("Stream error:", error);
			},
		});

		console.log("Stream response initiated.");
		return result.toUIMessageStreamResponse();
	} catch (error) {
		console.error("Chat API error:", error);
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
