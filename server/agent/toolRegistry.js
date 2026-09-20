const inventoryTool = require("../tools/inventoryTool");
const salesTool = require("../tools/salesTool");
const supplierTool = require("../tools/supplierTool");
const reorderTool = require("../tools/reorderTool");
const purchaseOrderTool = require("../tools/purchaseOrderTool");


const tools = {

    getInventory: {
        description:
            "Get all products and their current stock levels.",
        execute: inventoryTool.getInventory
    },


    getLowStockProducts: {
        description:
            "Get products whose stock is at or below their reorder level.",
        execute: inventoryTool.getLowStockProducts
    },


    getSalesData: {
        description:
            "Get recent sales data showing units sold for each product.",
        execute: salesTool.getSalesData
    },


    getSuppliers: {
        description:
            "Get supplier information and which products each supplier provides.",
        execute: supplierTool.getSuppliers
    },


    getReorderRecommendations: {
        description:
            "Analyze inventory, recent sales, and suppliers to determine which products should be reordered, how many units should be ordered, and which supplier provides them.",
        execute:
            reorderTool.getReorderRecommendations
    },


    createPurchaseOrder: {
        description:
            "Create a purchase order draft from current reorder recommendations. The order remains pending human approval.",
        execute:
            purchaseOrderTool.createPurchaseOrder
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


module.exports = {

    tools,

    getTool,

    getToolDescriptions

};