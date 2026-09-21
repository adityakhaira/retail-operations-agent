const {
    getToolDefinitions
} = require("./toolRegistry");


function getGeminiFunctionDeclarations() {

    const definitions =
        getToolDefinitions();

    return definitions.map(tool => {

        // Policy search needs a query from Gemini.
        if (tool.name === "searchStorePolicies") {

            return {
                name: tool.name,

                description:
                    tool.description,

                parameters: {
                    type: "OBJECT",

                    properties: {
                        query: {
                            type: "STRING",
                            description:
                                "The store policy information to search for, such as reorder policy, discount policy, supplier policy, or return policy."
                        }
                    },

                    required: [
                        "query"
                    ]
                }
            };
        }

        // Tools that currently require no arguments.
        return {
            name: tool.name,

            description:
                tool.description,

            parameters: {
                type: "OBJECT",
                properties: {}
            }
        };
    });
}


module.exports = {
    getGeminiFunctionDeclarations
};