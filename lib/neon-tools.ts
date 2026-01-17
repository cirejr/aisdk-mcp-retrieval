import { tool } from "ai";
import { z } from "zod";

/**
 * Creates simplified wrapper tools for the Neon MCP client.
 * These tools have simpler schemas that work better with smaller models,
 * while internally calling the full MCP tools via callTool.
 */
export function createNeonTools(mcpClient: { callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>; tools: () => Promise<Record<string, unknown>> }) {
    return {
        listProjects: tool({
            description: "List all available Neon database projects. Call this first to find project IDs.",
            parameters: z.object({}),
            execute: async (): Promise<string> => {
                console.log("[Tool] Calling list_projects...");
                const result = await mcpClient.callTool("list_projects", {});
                console.log("[Tool] list_projects result received");
                return JSON.stringify(result);
            },
        }),

        getProjectTables: tool({
            description: "Get all tables in a specific Neon project database",
            parameters: z.object({
                projectId: z.string().describe("The Neon project ID"),
                branchId: z.string().optional().describe("Branch ID (optional, uses main if not provided)"),
            }),
            execute: async ({ projectId, branchId }: { projectId: string; branchId?: string }): Promise<string> => {
                console.log(`[Tool] Calling get_database_tables for project ${projectId}...`);
                const result = await mcpClient.callTool("get_database_tables", {
                    project_id: projectId,
                    branch_id: branchId || "main",
                    database_name: "neondb",
                });
                console.log("[Tool] get_database_tables result received");
                return JSON.stringify(result);
            },
        }),

        runQuery: tool({
            description: "Execute a SQL query on a Neon database",
            parameters: z.object({
                projectId: z.string().describe("The Neon project ID"),
                query: z.string().describe("The SQL query to execute"),
            }),
            execute: async ({ projectId, query }: { projectId: string; query: string }): Promise<string> => {
                console.log(`[Tool] Calling run_sql for project ${projectId}...`);
                const result = await mcpClient.callTool("run_sql", {
                    project_id: projectId,
                    query: query,
                    database_name: "neondb",
                });
                console.log("[Tool] run_sql result received");
                return JSON.stringify(result);
            },
        }),

        describeTable: tool({
            description: "Get the schema/structure of a specific table",
            parameters: z.object({
                projectId: z.string().describe("The Neon project ID"),
                tableName: z.string().describe("The name of the table"),
            }),
            execute: async ({ projectId, tableName }: { projectId: string; tableName: string }): Promise<string> => {
                console.log(`[Tool] Calling describe_table_schema for ${tableName}...`);
                const result = await mcpClient.callTool("describe_table_schema", {
                    project_id: projectId,
                    table_name: tableName,
                    database_name: "neondb",
                });
                console.log("[Tool] describe_table_schema result received");
                return JSON.stringify(result);
            },
        }),
    };
}
