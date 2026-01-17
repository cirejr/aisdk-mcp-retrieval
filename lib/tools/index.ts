/**
 * Neon Database Tools
 * 
 * This module exports all Neon MCP tools with proper Zod schemas
 * for use with the AI SDK's tool calling feature.
 */

export { listProjectsTool } from "./list-projects";
export { getProjectTablesTool } from "./get-project-tables";
export { runQueryTool } from "./run-query";
export { describeTableTool } from "./describe-table";

// Re-export a convenience function to create all tools bound to an MCP client
import { tool } from "ai";
import { listProjectsTool } from "./list-projects";
import { getProjectTablesTool } from "./get-project-tables";
import { runQueryTool } from "./run-query";
import { describeTableTool } from "./describe-table";

type MCPClient = {
    callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
};

/**
 * Creates all Neon tools bound to an MCP client.
 * These tools can be passed directly to generateText or streamText.
 */
export function createNeonTools(mcpClient: MCPClient) {
    return {
        listProjects: tool({
            description: listProjectsTool.description,
            parameters: listProjectsTool.parameters,
            execute: async (args) => {
                const result = await listProjectsTool.execute(args as Record<string, never>, { mcpClient });
                return JSON.stringify(result);
            },
        }),

        getProjectTables: tool({
            description: getProjectTablesTool.description,
            parameters: getProjectTablesTool.parameters,
            execute: async (args) => {
                const result = await getProjectTablesTool.execute(args as { projectId: string; branchId?: string; databaseName?: string }, { mcpClient });
                return JSON.stringify(result);
            },
        }),

        runQuery: tool({
            description: runQueryTool.description,
            parameters: runQueryTool.parameters,
            execute: async (args) => {
                const result = await runQueryTool.execute(args as { projectId: string; query: string; databaseName?: string }, { mcpClient });
                return JSON.stringify(result);
            },
        }),

        describeTable: tool({
            description: describeTableTool.description,
            parameters: describeTableTool.parameters,
            execute: async (args) => {
                const result = await describeTableTool.execute(args as { projectId: string; tableName: string; databaseName?: string }, { mcpClient });
                return JSON.stringify(result);
            },
        }),
    };
}
