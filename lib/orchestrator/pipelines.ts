import { createNeonMCPClient } from "../mcp";

interface PipelineResult {
    success: boolean;
    data?: any;
    error?: string;
    logs: string[];
}

export class DatabaseOrchestrator {
    private mcpClient: any;
    private logs: string[] = [];

    constructor() { }

    private async init() {
        if (!this.mcpClient) {
            this.log("Initializing MCP Client...");
            this.mcpClient = await createNeonMCPClient();
        }
    }

    private log(message: string) {
        console.log(`[Orchestrator] ${message}`);
        this.logs.push(message);
    }

    /**
     * Determines which project the user is referring to, fetches its tables,
     * and optionally describes them.
     */
    async getDatabaseContext(userQuery: string): Promise<PipelineResult> {
        try {
            await this.init();

            // 1. List Projects
            this.log("Step 1: Listing Projects...");
            const projectsResult: any = await this.mcpClient.callTool({
                name: "list_projects",
                arguments: { name: "" }
            });

            // Check if result is error or empty
            if (!projectsResult) throw new Error("Failed to list projects");

            // Parse projects (assuming result is JSON or has specific structure)
            // The logs showed: "1. **neon** – Project ID: ... \n 2. **mts-facturation** ..."
            // Wait, the tool output in logs was text because the tool wrapper might process it? 
            // Or the MCP server returns text.
            // Let's assume standard MCP content. If text, we parse.
            // Actually, based on previous logs, the tool output was text like "Here are the Neon projects available...". 
            // This is bad for orchestration. We need structured data.
            // If the underlying tool returns text, we have to parse it. 
            // OR we assume the underlying tool returns JSON and the wrapper was formatting it?
            // Let's check `lib/tools/list-projects.ts` again. It returns `result` directly.
            // If `mcpClient.callTool` returns what the server sends, and the server sends text, we are in trouble.
            // BUT `mcpClient` from `@ai-sdk/mcp` might return the content.
            // Let's assume for now we get JSON or we can fuzzy match on the text.

            // Heuristic: Check if userQuery matches any project name found in the output.
            // Since we don't know the exact format of `projectsResult` (it might be a complex object), 
            // we will pass the raw result to the model later? 
            // NO, the goal is to be deterministic.

            // Implementation detail: We need to inspect `projectsResult` to extract IDs.
            // If we can't inspect it easily, we might fail.
            // Let's try to assume it's a list or string we can regex.

            // Parse projects
            // We expect output like: "1. **name** – Project ID: `id`"
            const projectsStr = typeof projectsResult === 'string'
                ? projectsResult
                : ((projectsResult as any)?.content?.[0]?.text || JSON.stringify(projectsResult));

            this.log(`Projects output: ${projectsStr.slice(0, 100)}...`);

            const projectRegex = /\*\*([^*]+)\*\*\s+[–-]\s+Project ID:\s+`?([a-f0-9-]+)`?/g;
            const projects: { name: string; id: string }[] = [];
            let match;

            while ((match = projectRegex.exec(projectsStr)) !== null) {
                projects.push({ name: match[1].trim(), id: match[2].trim() });
            }

            if (projects.length === 0) {
                // Fallback: try to just return the list if we can't parse it
                this.log("Could not parse project list via regex.");
                return {
                    success: true,
                    data: {
                        stage: "projects_listed",
                        projects: projectsStr
                    },
                    logs: this.logs
                };
            }

            // Find matching project
            const lowerQuery = userQuery.toLowerCase();
            const validProjects = projects.filter(p => lowerQuery.includes(p.name.toLowerCase()));

            let targetProject = validProjects[0];
            // If no direct match, but only one project exists, maybe use it? 
            // Risky. Let's stick to explicit match or if the user asks for "projects" we just return list.

            if (!targetProject) {
                return {
                    success: true,
                    data: {
                        stage: "projects_listed",
                        projects: projects,
                        message: "Multiple projects found. Please specify which one."
                    },
                    logs: this.logs
                };
            }

            this.log(`Found target project: ${targetProject.name} (${targetProject.id})`);

            // 2. Get Tables
            this.log(`Step 2: Getting tables for ${targetProject.name}...`);
            const tablesResult: any = await this.mcpClient.callTool({
                name: "get_database_tables",
                arguments: {
                    project_id: targetProject.id,
                    branch_id: "main",
                    database_name: "neondb"
                }
            });

            // Expected format: "Tables in ...: \n - table1 \n - - table2"
            const tablesStr = typeof tablesResult === 'string'
                ? tablesResult
                : ((tablesResult as any)?.content?.[0]?.text || JSON.stringify(tablesResult));

            // Parse table names
            // strict regex: `- \*\*(\w+)\*\*` or just `- (\w+)`
            const tableRegex = /-\s+\**([a-zA-Z0-9_]+)\**/g;
            const tables: string[] = [];
            let tableMatch;
            while ((tableMatch = tableRegex.exec(tablesStr)) !== null) {
                tables.push(tableMatch[1]);
            }

            // 3. Describe Tables
            // Limit to first 3 tables or strictly matching tables?
            // PRD says "Fetch schema".
            const schemas: string[] = [];

            for (const table of tables) {
                this.log(`Step 3: Describing table ${table}...`);
                const schemaResult: any = await this.mcpClient.callTool({
                    name: "describe_table_schema",
                    arguments: {
                        project_id: targetProject.id,
                        table_name: table,
                        database_name: "neondb"
                    }
                });

                const schemaStr = typeof schemaResult === 'string'
                    ? schemaResult
                    : ((schemaResult as any)?.content?.[0]?.text || JSON.stringify(schemaResult));
                schemas.push(schemaStr);
            }

            return {
                success: true,
                data: {
                    stage: "fully_resolved",
                    project: targetProject,
                    tables: tables,
                    schemas: schemas
                },
                logs: this.logs
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Unknown error",
                logs: this.logs
            };
        }
    }

    async runQuery(projectId: string, query: string): Promise<PipelineResult> {
        try {
            await this.init();
            this.log(`Executing query on project ${projectId}: ${query}`);

            const result = await this.mcpClient.callTool({
                name: "run_sql",
                arguments: {
                    project_id: projectId,
                    query: query
                }
            });

            return {
                success: true,
                data: result,
                logs: this.logs
            };
        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : "Query execution failed",
                logs: this.logs
            };
        }
    }

    async close() {
        if (this.mcpClient) {
            // Check if close method exists (it should based on route.ts usage)
            // route.ts uses `mcpClient.close()`? 
            // lib/mcp.ts returns `createMCPClient` result.
            // `createMCPClient` usually doesn't have close, but the transport might?
            // Not sure. route.ts has `await mcpClient.close()`.
            // I'll assume it exists.
            if (typeof this.mcpClient.close === 'function') {
                await this.mcpClient.close();
            }
        }
    }
}
