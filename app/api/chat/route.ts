import { ollama } from "ai-sdk-ollama";
import { generateText, streamText, Output } from "ai";
import { z } from "zod";
import { createNeonMCPClient } from "@/lib/mcp";

const IntentSchema = z.object({
	intent: z.enum(["list_tables", "describe_table", "run_query"]),
	projectName: z.string().optional(),
	tableNames: z.array(z.string()).optional(),
	userQuestion: z.string(),
});

const SQLSchema = z.object({
	sql: z.string().describe("Read-only PostgreSQL query"),
});

export async function POST(req: Request) {
	const { messages } = await req.json();
	const userMessage = messages.at(-1)?.content ?? "";

	const mcpClient = await createNeonMCPClient();

	try {
		/* ------------------------------------------------
		   1️⃣ Intent extraction (LLM, structured)
		------------------------------------------------ */

		const { output: intent } = await generateText({
			model: ollama("granite4:3b"),
			output: Output.object({ schema: IntentSchema }),
			system: "You are a database assistant. Extract the user's intent and target project/tables from their question. Return a valid JSON object.",
			prompt: `Analyze the following user question and extract the intent.

User question:
"${userMessage}"

If the user asks to list tables, intent is "list_tables".
If checking schema/structure, intent is "describe_table".
If asking for data/rows, intent is "run_query".
Extract project name if mentioned.
Extract table names if mentioned.`,
		});

		/* ------------------------------------------------
		   2️⃣ Load MCP tools (typed)
		------------------------------------------------ */

		const tools = await mcpClient.tools({
			schemas: {
				listProjects: {
					inputSchema: z.object({}),
				},
				getProjectTables: {
					inputSchema: z.object({
						projectId: z.string(),
					}),
				},
				describeTable: {
					inputSchema: z.object({
						projectId: z.string(),
						tableName: z.string(),
					}),
				},
				runQuery: {
					inputSchema: z.object({
						projectId: z.string(),
						query: z.string(),
					}),
				},
			},
		});

		/* ------------------------------------------------
		   3️⃣ Resolve project (deterministic)
		------------------------------------------------ */

		const projectsResult = await tools.listProjects.execute(
			{},
			{ messages: [], toolCallId: "list-projects" },
		);

		const projectsRaw = (projectsResult as any).content[0];
		if (projectsRaw.type !== "text") throw new Error("Unexpected content type from listProjects");
		const projects = JSON.parse(projectsRaw.text) as any[];
		const project = projects.find((p) =>
			intent.projectName
				? p.name.toLowerCase().includes(intent.projectName.toLowerCase())
				: true,
		);

		if (!project) throw new Error("No matching project found");

		const projectId = project.id;

		/* ------------------------------------------------
		   4️⃣ Load schema context
		------------------------------------------------ */

		const tablesResult = await tools.getProjectTables.execute(
			{ projectId },
			{ messages: [], toolCallId: "get-tables" },
		);

		const tablesRaw = (tablesResult as any).content[0];
		if (tablesRaw.type !== "text") throw new Error("Unexpected content type from getProjectTables");
		const tables = JSON.parse(tablesRaw.text) as any[];

		const tableSchemas =
			intent.tableNames?.length
				? await Promise.all(
					intent.tableNames.map(async (table) => {
						const res = await tools.describeTable.execute(
							{ projectId, tableName: table },
							{ messages: [], toolCallId: `describe-${table}` },
						);
						const content = (res as any).content[0];
						if (content.type !== "text") return { table, error: "Invalid content" };
						return JSON.parse(content.text);
					}),
				)
				: tables;

		/* ------------------------------------------------
		   5️⃣ SQL generation (LLM, single task)
		------------------------------------------------ */

		let sql: string | null = null;

		if (intent.intent === "run_query") {
			const { output } = await generateText({
				model: ollama("granite4:3b"),
				output: Output.object({ schema: SQLSchema }),
				prompt: `Generate a READ-ONLY PostgreSQL query.

						Available tables:
						${JSON.stringify(tableSchemas, null, 2)}

						User question:
						"${intent.userQuestion}"`,
			});

			sql = output.sql;
		}

		/* ------------------------------------------------
		   6️⃣ Execute query (deterministic)
		------------------------------------------------ */

		let queryData = null;
		if (sql !== null) {
			const queryResult = await tools.runQuery.execute(
				{ projectId, query: sql },
				{ messages: [], toolCallId: "run-query" },
			);
			const content = (queryResult as any).content[0];
			if (content.type === "text") {
				queryData = JSON.parse(content.text);
			} else {
				queryData = (queryResult as any).content;
			}
		}

		/* ------------------------------------------------
		   7️⃣ Final response (streamed, no tools)
		------------------------------------------------ */

		const result = streamText({
			model: ollama("ministral-3:3b"),
			system: "Explain database results clearly.",
			prompt: `
User question:
"${intent.userQuestion}"

SQL:
${sql ?? "N/A"}

Result:
${JSON.stringify(queryData, null, 2)}
`,
		});

		return result.toUIMessageStreamResponse();
	} finally {
		await mcpClient.close();
	}
}
