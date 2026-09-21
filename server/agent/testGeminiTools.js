const {
    askGeminiWithTools
} = require("../services/gemini");

const {
    getGeminiFunctionDeclarations
} = require("./geminiTools");

async function test() {

    const functions =
        getGeminiFunctionDeclarations();

    const response =
        await askGeminiWithTools(
            "Which products should I reorder right now? Use the appropriate tool.",
            functions
        );

    console.log(
        JSON.stringify(
            response,
            null,
            2
        )
    );
}

test();