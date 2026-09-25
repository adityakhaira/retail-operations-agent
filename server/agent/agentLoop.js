const {
    askGeminiWithTools,
    sendToolResultToGemini,
    buildAgentInstruction
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


    // ==================================================
    // INITIAL GEMINI REQUEST
    // ==================================================

    let response =
        await askGeminiWithTools(
            userMessage,
            functionDeclarations
        );


    // Keep the complete conversation history.
    //
    // This history will become:
    //
    // USER
    // ↓
    // MODEL TOOL CALL
    // ↓
    // TOOL RESULT
    // ↓
    // MODEL TOOL CALL
    // ↓
    // TOOL RESULT
    // ↓
    // FINAL ANSWER
    //
    const conversationHistory = [
        {
            role: "user",

            parts: [
                {
                    text:
                        buildAgentInstruction(
                            userMessage
                        )
                }
            ]
        }
    ];


    const MAX_ITERATIONS = 5;


    for (
        let iteration = 0;
        iteration < MAX_ITERATIONS;
        iteration++
    ) {

        console.log(
            `Agent iteration: ${iteration + 1}`
        );


        // ==================================================
        // READ GEMINI RESPONSE
        // ==================================================

        const parts =
            response
                .candidates?.[0]
                ?.content
                ?.parts || [];


        // ==================================================
        // CHECK FOR TOOL CALL
        // ==================================================

        const functionCallPart =
            parts.find(
                part => part.functionCall
            );


        // ==================================================
        // NO TOOL CALL = FINAL ANSWER
        // ==================================================

        if (!functionCallPart) {

            const text =
                parts
                    .filter(part => part.text)
                    .map(part => part.text)
                    .join("\n");

            return text;
        }


        // ==================================================
        // GET FUNCTION CALL
        // ==================================================

        const functionCall =
            functionCallPart.functionCall;


        console.log(
            `Agent selected tool: ${functionCall.name}`
        );


        // ==================================================
        // VALIDATE TOOL NAME
        // ==================================================

        const validToolNames =
            functionDeclarations.map(
                tool => tool.name
            );


        if (
            !validToolNames.includes(
                functionCall.name
            )
        ) {

            throw new Error(
                `Gemini selected unknown tool "${functionCall.name}". ` +
                `Available tools: ${validToolNames.join(", ")}`
            );
        }


        console.log(
            "Tool is valid."
        );


        // ==================================================
        // GET TOOL ARGUMENTS
        // ==================================================

        const toolArguments =
            functionCall.args || {};


        console.log(
            "Tool arguments:",
            toolArguments
        );


        // ==================================================
        // EXECUTE TOOL
        // ==================================================

        const toolResult =
            await executeTool(
                functionCall.name,
                toolArguments
            );


        console.log(
            `Tool executed: ${functionCall.name}`
        );


        // ==================================================
        // SEND RESULT BACK TO GEMINI
        // ==================================================

        const nextResult =
            await sendToolResultToGemini(
                conversationHistory,
                functionCallPart,
                toolResult,
                functionDeclarations
            );


        // Update response for next iteration.
        response =
            nextResult.response;


        // Update conversation history.
        //
        // IMPORTANT:
        // Preserve the model's complete response,
        // including thoughtSignature.
        conversationHistory.push(
            {
                role: "model",
                parts:
                    parts
            }
        );


        conversationHistory.push(
            {
                role: "user",

                parts: [
                    {
                        functionResponse: {

                            name:
                                functionCall.name,

                            response: {
                                result:
                                    toolResult
                            }
                        }
                    }
                ]
            }
        );
    }


    throw new Error(
        "Agent exceeded maximum tool-calling iterations."
    );
}


module.exports = {
    runAgentLoop
};