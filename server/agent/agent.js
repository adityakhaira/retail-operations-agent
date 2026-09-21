const { askGemini } = require("../services/gemini");
const { getTool, getToolDescriptions } = require("./toolRegistry");
const { systemPrompt } = require("./prompts");
const { logActivity } = require("../tools/activityLogTool");

function detectToolFromMessage(message) {
    const text = message.toLowerCase();

    // POLICY QUESTIONS
    if (
        text.includes("policy") ||
        text.includes("rule") ||
        text.includes("rules") ||
        text.includes("discount") ||
        text.includes("return") ||
        text.includes("refund") ||
        text.includes("supplier policy") ||
        text.includes("reorder policy")
    ) {
        return "searchStorePolicies";
    }

    // SUPPLIER QUESTIONS
    if (
        text.includes("supplier") ||
        text.includes("suppliers") ||
        text.includes("vendor") ||
        text.includes("vendors")
    ) {
        return "getSuppliers";
    }

    // REORDER QUESTIONS
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

    // LOW STOCK QUESTIONS
    if (
        text.includes("restock") ||
        text.includes("restocking") ||
        text.includes("low stock") ||
        text.includes("running out") ||
        text.includes("need to reorder")
    ) {
        return "getLowStockProducts";
    }

    // SALES QUESTIONS
    if (
        text.includes("sales") ||
        text.includes("sold") ||
        text.includes("selling") ||
        text.includes("fastest selling") ||
        text.includes("best selling")
    ) {
        return "getSalesData";
    }

    // INVENTORY QUESTIONS
    if (
        text.includes("inventory") ||
        text.includes("stock") ||
        text.includes("products")
    ) {
        return "getInventory";
    }

    return null;
}

async function runAgent(userMessage) {
    let selectedTool =
        detectToolFromMessage(userMessage);

    // ==================================================
    // ASK GEMINI TO SELECT TOOL IF KEYWORD ROUTING
    // DOES NOT FIND ONE
    // ==================================================

    if (!selectedTool) {
        const toolDescriptions =
            getToolDescriptions();

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

        const decisionResponse =
            await askGemini(decisionPrompt);

        logActivity({
            type: "tool_decision",
            userRequest: userMessage,
            decision: decisionResponse
        });

        try {
            const cleanedResponse =
                decisionResponse
                    .replace(/```json/g, "")
                    .replace(/```/g, "")
                    .trim();

            const decision =
                JSON.parse(cleanedResponse);

            if (
                decision.useTool === true
            ) {
                selectedTool =
                    decision.toolName;
            }
        } catch (error) {
            console.log(
                "Gemini returned an invalid tool decision."
            );
        }
    } else {
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
    // NO TOOL
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
    // GET TOOL
    // ==================================================

    const tool =
        getTool(selectedTool);

    if (!tool) {
        throw new Error(
            `Unknown tool selected: ${selectedTool}`
        );
    }

    console.log(
        `Agent selected tool: ${selectedTool}`
    );

    // ==================================================
    // EXECUTE TOOL
    // ==================================================

    let toolResult;

    if (
        selectedTool ===
        "searchStorePolicies"
    ) {
        toolResult =
            await tool.execute(
                userMessage
            );
    } else {
        toolResult =
            await tool.execute();
    }

    // ==================================================
    // LOG TOOL EXECUTION
    // ==================================================

    logActivity({
        type: "tool_execution",
        tool: selectedTool,
        result: toolResult
    });

    // ==================================================
    // FINAL ANSWER
    // ==================================================

    const finalPrompt = `
${systemPrompt}

User request:

"${userMessage}"

The agent selected this tool:

${selectedTool}

The tool returned the following data:

${JSON.stringify(
    toolResult,
    null,
    2
)}

IMPORTANT INSTRUCTIONS:

1. The tool result above contains information retrieved from the store's internal data or policy documents.

2. Use the tool result to answer the user's question.

3. If the tool result contains the answer, DO NOT say that the information is unavailable.

4. DO NOT claim that you need the user to provide the policy if the policy content is present in the tool result.

5. Do not invent information that is not present in the tool result.

6. Clearly explain the relevant information.

7. If this is a store policy question, explicitly identify that the answer comes from the store policy.

Answer the user directly.
`;

    const finalAnswer =
        await askGemini(finalPrompt);

    return finalAnswer;
}

module.exports = {
    runAgent
};