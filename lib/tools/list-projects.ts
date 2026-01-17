import { z } from "zod";

/**
 * Tool: listProjects
 * Lists all available Neon database projects.
 * This should be called FIRST to discover project IDs.
 */
export const listProjectsTool = {
    description: "List all available Neon database projects. Call this first to find project IDs before making other database queries.",
    parameters: z.object({}),
    execute: async (_args: Record<string, never>, { mcpClient }: { mcpClient: { callTool: (name: string, args: Record<string, unknown>) => Promise<unknown> } }) => {
        console.log("[listProjects] Calling MCP list_projects...");
        try {
            const result = await mcpClient.callTool("list_projects", {});
            console.log("[listProjects] Success");
            return result;
        } catch (error) {
            console.error("[listProjects] Error:", error);
            return { error: error instanceof Error ? error.message : "Failed to list projects" };
        }
    },
};
