import { z } from "zod";

/**
 * Tool: getProjectTables
 * Gets all tables in a specific Neon project database.
 */
export const getProjectTablesTool = {
    description: "Get all tables in a specific Neon project database. Requires a projectId obtained from listProjects.",
    parameters: z.object({
        projectId: z.string().describe("The Neon project ID (e.g., 'aged-smoke-12345678')"),
        branchId: z.string().optional().describe("Optional branch ID. Defaults to 'main' if not provided."),
        databaseName: z.string().optional().describe("Optional database name. Defaults to 'neondb' if not provided."),
    }),
    execute: async (
        { projectId, branchId, databaseName }: { projectId: string; branchId?: string; databaseName?: string },
        { mcpClient }: { mcpClient: { callTool: (name: string, args: Record<string, unknown>) => Promise<unknown> } }
    ) => {
        console.log(`[getProjectTables] Calling MCP get_database_tables for project ${projectId}...`);
        try {
            const result = await mcpClient.callTool("get_database_tables", {
                params: {
                    name: "get_database_tables",
                    project_id: projectId,
                    branch_id: branchId || "main",
                    database_name: databaseName || "neondb",
                }
            });
            console.log("[getProjectTables] Success");
            return result;
        } catch (error) {
            console.error("[getProjectTables] Error:", error);
            return { error: error instanceof Error ? error.message : "Failed to get tables" };
        }
    },
};
