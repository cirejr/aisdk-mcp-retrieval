import { ollama } from "ai-sdk-ollama";
import { streamText, convertToModelMessages, stepCountIs, generateText } from "ai";
import { DatabaseOrchestrator } from "@/lib/orchestrator";

export async function POST(req: Request) {
	const { messages }: { messages: any[] } = await req.json();
	const lastMessage = messages[messages.length - 1];
	console.log("Received messages:", JSON.stringify(messages, null, 2));

	try {
		const orc = new DatabaseOrchestrator();

		// Step 1: Gather Context
		console.log("Orchestrator: Gathering context...");
		const context = await orc.getDatabaseContext(lastMessage.content);

		// If we have a fully resolved project and tables
		if (context.success && context.data?.stage === "fully_resolved") {
			console.log("Orchestrator: Context resolved. Generating SQL...");

			// Step 2: Generate SQL
			const { text: sql } = await generateText({
				model: ollama("qwen2.5-coder:7b"), // Use a stronger model for SQL if available, else granite
				system: `You are a PostgreSQL expert. 
Given the following database schema, write a SQL query to answer the user's request.
Return ONLY the raw SQL query, no markdown formatting, no explanations.

Schema:
${context.data.schemas.join("\n\n")}`,
				prompt: `User Request: "${lastMessage.content}"`
			});

			const cleanerSql = sql.replace(/```sql/g, '').replace(/```/g, '').trim();
			console.log("Orchestrator: Generated SQL:", cleanerSql);

			// Step 3: Execute SQL
			console.log("Orchestrator: Executing SQL...");
			const queryResult = await orc.runQuery(context.data.project.id, cleanerSql);

			// Step 4: Final Response
			console.log("Orchestrator: Streaming final response...");
			const result = streamText({
				model: ollama("granite3.1-dense:8b"),
				system: "You are a helpful database assistant.",
				prompt: `User Request: "${lastMessage.content}"
                
I have executed the following SQL query:
${cleanerSql}

The Result is:
${JSON.stringify(queryResult.data, null, 2)}

Please explain this result to the user in a friendly way.`
			});

			return result.toUIMessageStreamResponse();
		}

		// If we found projects but need to clarify
		if (context.success && context.data?.stage === "projects_listed") {
			console.log("Orchestrator: projects listed, asking user to clarify.");
			const result = streamText({
				model: ollama("granite3.1-dense:8b"),
				system: "You are a helpful database assistant.",
				prompt: `The user asked: "${lastMessage.content}".
I found the following projects:
${context.data.projects}

The user's request was ambiguous or I couldn't find a matching project. 
Please list the projects found and ask the user to specify which one they want to query.`
			});
			return result.toUIMessageStreamResponse();
		}

		// Fallback: If orchestrator didn't trigger meaningful action, just chat?
		// Or maybe context failed.
		console.log("Orchestrator: Fallback to normal chat.");
		// We can just stream text with context of failure?
		const result = streamText({
			model: ollama("granite3.1-dense:8b"),
			messages: await convertToModelMessages(messages),
			system: "You are a database assistant. I tried to access the database but couldn't understand the intent or connection was failed. Please ask the user for clarification."
		});

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
