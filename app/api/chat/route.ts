import { ollama } from "ai-sdk-ollama";
import { streamText, UIMessage, convertToModelMessages, stepCountIs } from "ai";
import { createNeonMCPClient } from "@/lib/mcp";

export const maxDuration = 60;

export async function POST(req: Request) {
	const { messages }: { messages: UIMessage[] } = await req.json();
	console.log("messages", messages);

	// Initialize Neon MCP client
	const mcpClient = await createNeonMCPClient();

	// Get tools from MCP server
	const tools = await mcpClient.tools();

	const result = streamText({
		model: ollama("ministral-3:3b"),
		messages: await convertToModelMessages(messages),
		tools,
		stopWhen: stepCountIs(5), // Allow multi-step tool calls
		onFinish: async () => {
			// Always close MCP client when done
			await mcpClient.close();
		},
	});
	console.log("result", result);
	return result.toUIMessageStreamResponse();
}
