const {
    askGeminiWithTools,
    sendToolResultToGemini
} = require("../services/gemini");

const {
    getGeminiFunctionDeclarations
} = require("./geminiTools");

const {
    executeTool
} = require("./toolExecutor");


async function runAgentLoop(userMessage) {

    const functionDeclarations =
        getGeminiFunctionDeclarations();

    let response =
        await askGeminiWithTools(
            userMessage,
            functionDeclarations
        );

    const MAX_ITERATIONS = 5;

    for (
        let iteration = 0;
        iteration < MAX_ITERATIONS;
        iteration++
    ) {

        const parts =
            response
                .candidates?.[0]
                ?.content
                ?.parts || [];

        const functionCallPart =
            parts.find(
                part => part.functionCall
            );

        // Gemini has finished reasoning
        // and returned a normal answer.
        if (!functionCallPart) {

            const text =
                parts
                    .filter(part => part.text)
                    .map(part => part.text)
                    .join("\n");

            return text;
        }

        const functionCall =
            functionCallPart.functionCall;

        console.log(
            `Agent selected tool: ${functionCall.name}`
        );

        console.log(
            "Tool arguments:",
            functionCall.args || {}
        );

        const toolResult =
            await executeTool(
                functionCall.name,
                functionCall.args || {}
            );

        console.log(
            `Tool executed: ${functionCall.name}`
        );

        response =
            await sendToolResultToGemini(
                userMessage,
                functionCallPart,
                toolResult
            );
    }

    throw new Error(
        "Agent exceeded maximum tool-calling iterations."
    );
}


module.exports = {
    runAgentLoop
};