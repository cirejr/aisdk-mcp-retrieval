import { z } from "zod";

/**
 * Tool: runQuery
 * Executes a SQL query on a Neon project database.
 */
export const runQueryTool = {
    description: "Execute a SQL query on a Neon project database. Use this to retrieve data, run SELECT statements, or perform database operations.",
    parameters: z.object({
        projectId: z.string().describe("The Neon project ID (e.g., 'aged-smoke-12345678')"),
        query: z.string().describe("The SQL query to execute (e.g., 'SELECT * FROM users LIMIT 10')"),
        databaseName: z.string().optional().describe("Optional database name. Defaults to 'neondb' if not provided."),
    }),
    execute: async (
        { projectId, query, databaseName }: { projectId: string; query: string; databaseName?: string },
        { mcpClient }: { mcpClient: { callTool: (name: string, args: Record<string, unknown>) => Promise<unknown> } }
    ) => {
        console.log(`[runQuery] Calling MCP run_sql for project ${projectId}...`);
        console.log(`[runQuery] Query: ${query.substring(0, 100)}...`);
        try {
            const result = await mcpClient.callTool("run_sql", {
                params: {
                    name: "run_sql",
                    project_id: projectId,
                    query: query,
                    database_name: databaseName || "neondb",
                }
            });
            console.log("[runQuery] Success");
            return result;
        } catch (error) {
            console.error("[runQuery] Error:", error);
            return { error: error instanceof Error ? error.message : "Failed to run query" };
        }
    },
};
