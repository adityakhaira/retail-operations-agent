const {
    getToolDefinitions
} = require("./toolRegistry");


function getGeminiFunctionDeclarations() {

    const definitions =
        getToolDefinitions();

    return definitions.map(tool => {

        if (tool.name === "searchStorePolicies") {

            return {
                name: tool.name,

                description:
                    "Search the store's business policy documents. IMPORTANT: The only valid policy tool name is searchStorePolicies. Use this tool for reorder, supplier, discount, return, refund, or other store policy questions.",

                parameters: {
                    type: "OBJECT",

                    properties: {
                        query: {
                            type: "STRING",

                            description:
                                "The policy information to search for, such as reorder policy, supplier policy, discount policy, or return policy."
                        }
                    },

                    required: [
                        "query"
                    ]
                }
            };
        }

        return {
            name: tool.name,

            description:
                `${tool.description} Use ONLY this exact tool name when calling this capability.`,

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