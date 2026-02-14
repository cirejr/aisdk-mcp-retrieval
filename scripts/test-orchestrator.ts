import { DatabaseOrchestrator } from "../lib/orchestrator";

async function main() {
    console.log("Starting Orchestrator Test...");
    const orc = new DatabaseOrchestrator();

    try {
        // Test 1: Gather Context
        console.log("\n--- Test 1: Gather Context for 'mts-facturation' ---");
        const context = await orc.getDatabaseContext("Show me the last invoice in mts-facturation");
        console.log("Success:", context.success);
        console.log("Stage:", context.data?.stage);

        if (context.success && context.data?.stage === "fully_resolved") {
            console.log("Project Found:", context.data.project.name);
            console.log("Tables Found:", context.data.tables.join(", "));
            console.log("Schemas Count:", context.data.schemas.length);
        } else {
            console.log("Success: false");
            console.log("Error:", context.error);
            console.log("Logs:", JSON.stringify(context.logs, null, 2));
        }

        // Test 2: Run Query (Mocking SQL generation)
        // Only run if we found the project
        if (context.success && context.data?.stage === "fully_resolved") {
            console.log("\n--- Test 2: Execute Query ---");
            const projectId = context.data.project.id;
            // Assuming 'invoices' table exists, or fallback to something safe.
            // Be careful with SQL. 
            // We'll try a safe query if user didn't provide one?
            // "SELECT * FROM invoices LIMIT 1" involves guessing table name.
            // We can look at tables found.
            const tableName = context.data.tables[0];
            if (tableName) {
                const query = `SELECT * FROM ${tableName} LIMIT 1`;
                console.log(`Executing: ${query}`);
                const result = await orc.runQuery(projectId, query);
                console.log("Query Result Success:", result.success);
                console.log("Query Data:", JSON.stringify(result.data, null, 2));
            } else {
                console.log("No tables to query.");
            }
        }

    } catch (error) {
        console.error("Test Failed:", error);
    } finally {
        await orc.close();
        console.log("\nTest Completed.");
    }
}

main();
