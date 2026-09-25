const inventoryTool = require("../tools/inventoryTool");
const salesTool = require("../tools/salesTool");
const supplierTool = require("../tools/supplierTool");
const reorderTool = require("../tools/reorderTool");
const purchaseOrderTool = require("../tools/purchaseOrderTool");
const policySearchTool = require("../tools/policySearchTool");

const tools = {

    getInventory: {
    description:
        "Get the complete current inventory of all store products, including product name, category, stock, price, and reorder level. Use this tool when the user asks to see products, inventory, stock levels, or all products.",
    execute:
        inventoryTool.getInventory
},

getLowStockProducts: {
    description:
        "Get products whose current stock is at or below their reorder level. Use this tool when the user asks which products are low in stock.",
    execute:
        inventoryTool.getLowStockProducts
},

getReorderRecommendations: {
    description:
        "Analyze current inventory, recent 7-day sales, and supplier data to determine which products need reordering and the recommended quantities. Use this tool for questions about what to reorder, what to restock, or recommended reorder quantities.",
    execute:
        reorderTool.getReorderRecommendations
},

    createPurchaseOrder: {
        description:
            "Create a purchase order draft for products that need reordering. The order remains pending human approval.",
        execute:
            purchaseOrderTool.createPurchaseOrder
    },

    searchStorePolicies: {
        description:
            "Search the store's business policies and return relevant policy information.",
        execute:
            policySearchTool.searchPolicies
    }
};

function getTool(name) {
    return tools[name];
}

function getToolDescriptions() {
    return Object.entries(tools)
        .map(
            ([name, tool]) =>
                `${name}: ${tool.description}`
        )
        .join("\n");
}

function getToolDefinitions() {
    return Object.entries(tools).map(
        ([name, tool]) => ({
            name: name,
            description: tool.description
        })
    );
}

module.exports = {
    tools,
    getTool,
    getToolDescriptions,
    getToolDefinitions
};