const {
    runAgentLoop
} = require("./agentLoop");

async function test() {

    const answer =
        await runAgentLoop(
            "Which products should I reorder right now?"
        );

    console.log("\n========== FINAL AGENT ANSWER ==========\n");
    console.log(answer);
    console.log("\n========================================\n");
}

test().catch(error => {
    console.error(error);
});