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

    // Most tools currently accept no arguments.
    // Policy search specifically needs the query string.
    if (toolName === "searchStorePolicies") {

        return await tool.execute(
            args.query
        );
    }

    return await tool.execute(args);
}


module.exports = {
    executeTool
};