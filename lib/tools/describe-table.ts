import { z } from "zod";

/**
 * Tool: describeTable
 * Gets the schema/structure of a specific table in a Neon project.
 */
export const describeTableTool = {
    description: "Get the schema and structure of a specific table in a Neon project database. Returns column names, types, and constraints.",
    parameters: z.object({
        projectId: z.string().describe("The Neon project ID (e.g., 'aged-smoke-12345678')"),
        tableName: z.string().describe("The name of the table to describe (e.g., 'users')"),
        databaseName: z.string().optional().describe("Optional database name. Defaults to 'neondb' if not provided."),
    }),
    execute: async (
        { projectId, tableName, databaseName }: { projectId: string; tableName: string; databaseName?: string },
        { mcpClient }: { mcpClient: { callTool: (name: string, args: Record<string, unknown>) => Promise<unknown> } }
    ) => {
        console.log(`[describeTable] Calling MCP describe_table_schema for ${tableName}...`);
        try {
            const result = await mcpClient.callTool("describe_table_schema", {
                name: "describe_table_schema",
                project_id: projectId,
                table_name: tableName,
                database_name: databaseName || "neondb",
            });
            console.log("[describeTable] Success");
            return result;
        } catch (error) {
            console.error("[describeTable] Error:", error);
            return { error: error instanceof Error ? error.message : "Failed to describe table" };
        }
    },
};
