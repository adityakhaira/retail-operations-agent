const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});


function buildAgentInstruction(userMessage) {

    return `
You are the Retail Operations Agent.

IMPORTANT RULES:

1. Use the available tools to retrieve real store information.
2. Never invent products, product IDs, suppliers, stock levels, sales numbers, prices, or reorder quantities.
3. Only use information returned by tools.
4. If information is missing, say that it is unavailable.
5. When multiple tools are needed, use them before producing the final answer.
6. Do not assume the store sells products that were not returned by the tools.
7. Use ONLY the exact tool names provided in the function declarations.
8. Never create, rename, or invent a tool name.
9. For policy questions, use searchStorePolicies.
10. For reorder questions, use getReorderRecommendations.
11. For inventory questions, use getInventory.
12. For low-stock questions, use getLowStockProducts.
13. Preserve exact values returned by the tools.

User request:

${userMessage}
`;
}


async function askGemini(prompt) {

    try {

        const response =
            await ai.models.generateContent({
                model: "gemini-3.6-flash",
                contents: prompt
            });

        return response.text;

    } catch (error) {

        console.error(
            "========== GEMINI API ERROR =========="
        );

        console.error(error);

        console.error(
            "======================================"
        );

        throw error;
    }
}


async function askGeminiWithTools(
    prompt,
    functionDeclarations
) {

    try {

        const response =
            await ai.models.generateContent({

                model: "gemini-3.6-flash",

                contents: [
                    {
                        role: "user",

                        parts: [
                            {
                                text:
                                    buildAgentInstruction(
                                        prompt
                                    )
                            }
                        ]
                    }
                ],

                config: {
                    tools: [
                        {
                            functionDeclarations:
                                functionDeclarations
                        }
                    ]
                }
            });

        return response;

    } catch (error) {

        console.error(
            "========== GEMINI TOOL ERROR =========="
        );

        console.error(error);

        console.error(
            "======================================="
        );

        throw error;
    }
}


/*
    Continue an existing Gemini conversation.

    conversationHistory contains:

    user
      ↓
    model function call
      ↓
    user function response
      ↓
    model function call
      ↓
    user function response
      ↓
    ...
*/
async function sendToolResultToGemini(
    conversationHistory,
    functionCallPart,
    toolResult,
    functionDeclarations
) {

    try {

        const updatedHistory = [
            ...conversationHistory,

            // Preserve Gemini's COMPLETE model response part.
            // This is important because it contains
            // the thoughtSignature.
            {
                role: "model",
                parts: [
                    functionCallPart
                ]
            },

            // Give the tool result back to Gemini.
            {
                role: "user",
                parts: [
                    {
                        functionResponse: {

                            name:
                                functionCallPart
                                    .functionCall
                                    .name,

                            response: {
                                result:
                                    toolResult
                            }
                        }
                    }
                ]
            }
        ];


        const response =
            await ai.models.generateContent({

                model: "gemini-3.6-flash",

                contents:
                    updatedHistory,

                config: {
                    tools: [
                        {
                            functionDeclarations:
                                functionDeclarations
                        }
                    ]
                }
            });


        return {
            response,
            conversationHistory:
                updatedHistory
        };

    } catch (error) {

        console.error(
            "========== GEMINI TOOL RESULT ERROR =========="
        );

        console.error(error);

        console.error(
            "==============================================="
        );

        throw error;
    }
}


module.exports = {
    askGemini,
    askGeminiWithTools,
    sendToolResultToGemini,
    buildAgentInstruction
};