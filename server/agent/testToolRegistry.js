const {
    getToolDefinitions
} = require("./toolRegistry");

console.log(
    JSON.stringify(
        getToolDefinitions(),
        null,
        2
    )
);