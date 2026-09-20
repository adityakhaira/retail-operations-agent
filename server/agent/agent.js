const { askGemini } = require("../services/gemini");

const {
    getTool,
    getToolDescriptions
} = require("./toolRegistry");

const { systemPrompt } = require("./prompts");

const {
    logActivity
} = require("../tools/activityLogTool");


// ======================================================
// DETERMINE TOOL FROM USER REQUEST
// ======================================================

function detectToolFromMessage(message) {

    const text = message.toLowerCase();


    // --------------------------------------------------
    // SUPPLIER QUESTIONS
    // --------------------------------------------------

    if (
        text.includes("supplier") ||
        text.includes("suppliers") ||
        text.includes("vendor") ||
        text.includes("vendors")
    ) {
        return "getSuppliers";
    }


// --------------------------------------------------
// REORDER RECOMMENDATION QUESTIONS
// --------------------------------------------------

if (
    text.includes("what should i reorder") ||
    text.includes("what should i restock") ||
    text.includes("what do i need to reorder") ||
    text.includes("how much should i reorder") ||
    text.includes("how much should i restock") ||
    text.includes("reorder recommendation") ||
    text.includes("reorder recommendations") ||
    text.includes("recommended reorder") ||
    text.includes("recommended restock")
) {
    return "getReorderRecommendations";
}


// --------------------------------------------------
// LOW STOCK / RESTOCKING
// --------------------------------------------------

if (
    text.includes("restock") ||
    text.includes("restocking") ||
    text.includes("low stock") ||
    text.includes("running out") ||
    text.includes("need to reorder")
) {
    return "getLowStockProducts";
}


    // --------------------------------------------------
    // SALES QUESTIONS
    // --------------------------------------------------

    if (
        text.includes("sales") ||
        text.includes("sold") ||
        text.includes("selling") ||
        text.includes("fastest selling") ||
        text.includes("best selling")
    ) {
        return "getSalesData";
    }


    // --------------------------------------------------
    // GENERAL INVENTORY QUESTIONS
    // --------------------------------------------------

    if (
        text.includes("inventory") ||
        text.includes("stock") ||
        text.includes("products")
    ) {
        return "getInventory";
    }


    // No obvious tool
    return null;
}


// ======================================================
// MAIN AGENT
// ======================================================

async function runAgent(userMessage) {


    // ==================================================
    // STEP 1: TRY DETERMINISTIC TOOL DETECTION
    // ==================================================

    let selectedTool = detectToolFromMessage(userMessage);


    // ==================================================
    // STEP 2: IF NO CLEAR TOOL, ASK GEMINI
    // ==================================================

    if (!selectedTool) {

        const toolDescriptions = getToolDescriptions();

        const decisionPrompt = `
${systemPrompt}

Available tools:

${toolDescriptions}

User request:
"${userMessage}"

Choose the most appropriate tool.

Respond ONLY with valid JSON:

{
    "useTool": true,
    "toolName": "exact_tool_name"
}

OR:

{
    "useTool": false
}

Do not add explanations.
Do not use markdown.
`;

        const decisionResponse = await askGemini(decisionPrompt);


        logActivity({
            type: "tool_decision",
            userRequest: userMessage,
            decision: decisionResponse
        });


        try {

            const cleanedResponse = decisionResponse
                .replace(/```json/g, "")
                .replace(/```/g, "")
                .trim();

            const decision = JSON.parse(cleanedResponse);


            if (decision.useTool === true) {

                selectedTool = decision.toolName;

            }

        } catch (error) {

            console.log(
                "Gemini returned an invalid tool decision."
            );

        }

    } else {

        // Log deterministic decision

        logActivity({
            type: "tool_decision",
            userRequest: userMessage,
            decision: JSON.stringify({
                useTool: true,
                toolName: selectedTool,
                method: "keyword_router"
            })
        });

    }


    // ==================================================
    // STEP 3: NO TOOL
    // ==================================================

    if (!selectedTool) {

        return await askGemini(`
${systemPrompt}

User request:

${userMessage}

Answer the user clearly.

Do not invent store data.
`);

    }


    // ==================================================
    // STEP 4: GET TOOL
    // ==================================================

    const tool = getTool(selectedTool);


    if (!tool) {

        throw new Error(
            `Unknown tool selected: ${selectedTool}`
        );

    }


    // ==================================================
    // STEP 5: EXECUTE TOOL
    // ==================================================

    console.log(
        `Agent selected tool: ${selectedTool}`
    );


    const toolResult = await tool.execute();


    // ==================================================
    // STEP 6: LOG TOOL EXECUTION
    // ==================================================

    logActivity({
        type: "tool_execution",
        tool: selectedTool,
        result: toolResult
    });


    // ==================================================
    // STEP 7: SEND TOOL RESULT TO GEMINI
    // ==================================================

    const finalPrompt = `
${systemPrompt}

User request:

"${userMessage}"

The agent selected this tool:

${selectedTool}

The tool returned the following REAL store data:

${JSON.stringify(toolResult, null, 2)}

Answer the user's question using ONLY this data.

Do not say that supplier information is unavailable
if supplier information exists in the tool result.

Do not invent information.

Give a clear answer using bullet points where useful.
`;


    // ==================================================
    // STEP 8: FINAL AI RESPONSE
    // ==================================================

    const finalAnswer = await askGemini(finalPrompt);


    return finalAnswer;
}


module.exports = {
    runAgent
};