const inventoryTool = require("../tools/inventoryTool");
const salesTool = require("../tools/salesTool");
const supplierTool = require("../tools/supplierTool");
const reorderTool = require("../tools/reorderTool");
const purchaseOrderTool = require("../tools/purchaseOrderTool");
const policySearchTool = require("../tools/policySearchTool");

const tools = {

    getInventory: {
        description:
            "Get all products and their current stock levels.",
        execute:
            inventoryTool.getInventory
    },

    getLowStockProducts: {
        description:
            "Get products whose stock is at or below their reorder level.",
        execute:
            inventoryTool.getLowStockProducts
    },

    getSalesData: {
        description:
            "Get recent sales data showing units sold for each product.",
        execute:
            salesTool.getSalesData
    },

    getSuppliers: {
        description:
            "Get supplier information.",
        execute:
            supplierTool.getSuppliers
    },

    getReorderRecommendations: {
        description:
            "Analyze inventory, sales and suppliers to determine which products need reordering and the recommended quantities.",
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