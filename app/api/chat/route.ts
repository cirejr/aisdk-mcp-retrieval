import { ollama } from "ai-sdk-ollama";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { createNeonMCPClient } from "@/lib/mcp";

export const maxDuration = 60;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  // Initialize Neon MCP client
  const mcpClient = await createNeonMCPClient();

  // Get tools from MCP server
  const tools = await mcpClient.tools();

  const result = streamText({
    model: ollama("gemma3:4b"),
    messages: await convertToModelMessages(messages),
    tools,
    onFinish: async () => {
      // Always close MCP client when done
      await mcpClient.close();
    },
  });

  return result.toUIMessageStreamResponse();
}
