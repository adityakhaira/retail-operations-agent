const { runAgentLoop } = require("./agentLoop");
const { logActivity } = require("../tools/activityLogTool");


async function runAgent(userMessage) {

    if (
        !userMessage ||
        !userMessage.trim()
    ) {
        throw new Error(
            "User message cannot be empty."
        );
    }

    console.log(
        `Agent request: ${userMessage}`
    );

    // Log the incoming request.
    logActivity({
        type: "agent_request",
        userRequest: userMessage,
        status: "RECEIVED"
    });

    try {

        // Run the real Gemini tool-calling loop.
        const answer =
            await runAgentLoop(
                userMessage
            );

        // Log successful completion.
        logActivity({
            type: "agent_response",
            userRequest: userMessage,
            status: "COMPLETED"
        });

        return answer;

    } catch (error) {

        // Log failed agent execution.
        logActivity({
            type: "agent_error",
            userRequest: userMessage,
            reason:
                error.message ||
                "Unknown agent error",
            status: "FAILED"
        });

        throw error;
    }
}


module.exports = {
    runAgent
};