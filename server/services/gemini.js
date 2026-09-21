const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, "../.env")
});

const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

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

                contents: prompt,

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

async function sendToolResultToGemini(
    originalPrompt,
    functionCallPart,
    toolResult
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
                                text: originalPrompt
                            }
                        ]
                    },
                    {
    role: "model",
    parts: [
        functionCallPart
    ]
},
                    {
                        role: "user",
                        parts: [
                            {
                                functionResponse: {
                                   name:
    functionCallPart.functionCall.name,
                                    response: {
                                        result:
                                            toolResult
                                    }
                                }
                            }
                        ]
                    }
                ]
            });

        return response;

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
    sendToolResultToGemini
};