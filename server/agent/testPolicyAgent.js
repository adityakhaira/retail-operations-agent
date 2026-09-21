const {
    runAgentLoop
} = require("./agentLoop");


async function test() {

    const answer =
        await runAgentLoop(
            "What is our store's reorder policy?"
        );

    console.log(
        "\n========== FINAL AGENT ANSWER ==========\n"
    );

    console.log(answer);

    console.log(
        "\n========================================\n"
    );
}


test().catch(error => {
    console.error(error);
});