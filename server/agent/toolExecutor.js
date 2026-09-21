const {
    getTool
} = require("./toolRegistry");

async function executeTool(
    toolName,
    args = {}
) {

    const tool = getTool(toolName);

    if (!tool) {
        throw new Error(
            `Tool "${toolName}" was not found.`
        );
    }

    console.log(
        `Executing tool: ${toolName}`
    );

    const result =
        await tool.execute(args);

    return result;
}

module.exports = {
    executeTool
};