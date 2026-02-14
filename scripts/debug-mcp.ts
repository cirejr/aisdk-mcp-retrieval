import { createNeonMCPClient } from "../lib/mcp";

async function main() {
    console.log("Creating Client...");
    const client = await createNeonMCPClient();
    console.log("Client keys:", Object.keys(client));
    if (client.callTool) {
        console.log("callTool type:", typeof client.callTool);
        console.log("callTool length (args):", client.callTool.length);
    }

    // Try variant 1: (name, args)
    try {
        console.log("Trying (name, args)...");
        const res = await client.callTool("list_projects", { name: "neon" });
        console.log("Variant 1 success:", JSON.stringify(res).slice(0, 50));
    } catch (e: any) {
        console.log("Variant 1 failed:", e.message || JSON.stringify(e));
    }

    // Try variant 2: ({ name, arguments })
    try {
        console.log("Trying object { name, arguments }...");
        // @ts-ignore
        const res = await client.callTool({ name: "list_projects", arguments: { name: "neon" } });
        console.log("Variant 2 success:", JSON.stringify(res).slice(0, 50));
    } catch (e: any) {
        console.log("Variant 2 failed:", e.message || JSON.stringify(e));
    }

    try {
        // cleanup
        if (client.close) await client.close();
    } catch (e) { }
}

main();
