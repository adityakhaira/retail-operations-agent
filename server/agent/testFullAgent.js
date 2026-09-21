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

async function test() {

    const userMessage =
        "Which products should I reorder right now?";

    // STEP 1: Ask Gemini which tool to use
    const functions =
        getGeminiFunctionDeclarations();

    const firstResponse =
        await askGeminiWithTools(
            userMessage,
            functions
        );

   const functionCallPart =
    firstResponse
        .candidates?.[0]
        ?.content
        ?.parts
        ?.find(
            part => part.functionCall
        );

const functionCall =
    functionCallPart?.functionCall;

    if (!functionCall) {

        console.log(
            "Gemini did not request a tool."
        );

        return;
    }

    console.log("\nGemini selected:");
    console.log(
        functionCall.name
    );

    // STEP 2: Execute the tool
    const toolResult =
        await executeTool(
            functionCall.name,
            functionCall.args
        );

    console.log("\nTool executed successfully.");

    // STEP 3: Send result back to Gemini
    const finalResponse =
    await sendToolResultToGemini(
        userMessage,
        functionCallPart,
        toolResult
    );

    const finalText =
        finalResponse
            .candidates?.[0]
            ?.content
            ?.parts
            ?.map(part => part.text)
            .filter(Boolean)
            .join("\n");

    console.log("\nFINAL GEMINI ANSWER:");
    console.log(finalText);
}

test();