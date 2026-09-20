const reorderTool = require("./reorderTool");


// Store purchase orders in memory for now.
// Later we can move this into a database.

const purchaseOrders = [];


// ======================================================
// CREATE PURCHASE ORDER DRAFT
// ======================================================

function createPurchaseOrder() {

    const recommendations =
        reorderTool.getReorderRecommendations();


    // Only include products that actually need
    // to be reordered.

    const items = recommendations
        .filter(item => item.needsReorder)
        .map(item => ({

            productId: item.productId,

            productName: item.productName,

            quantity: item.recommendedQuantity,

            supplierId: item.supplier
                ? item.supplier.id
                : null,

            supplierName: item.supplier
                ? item.supplier.name
                : "Unknown",

            supplierContact: item.supplier
                ? item.supplier.contact
                : null

        }));


    // If nothing needs to be ordered

    if (items.length === 0) {

        return {

            success: true,

            message:
                "No products currently require reordering.",

            purchaseOrder: null

        };

    }


    // Calculate total number of units

    const totalUnits = items.reduce(
        (total, item) =>
            total + item.quantity,
        0
    );


    // Create purchase order

    const purchaseOrder = {

        id:
            `PO-${Date.now()}`,

        status:
            "PENDING_APPROVAL",

        createdAt:
            new Date().toISOString(),

        items:

            items,

        totalUnits:
            totalUnits

    };


    // Store it

    purchaseOrders.push(
        purchaseOrder
    );


    return {

        success: true,

        message:
            "Purchase order draft created and is waiting for approval.",

        purchaseOrder:
            purchaseOrder

    };

}


// ======================================================
// GET PURCHASE ORDERS
// ======================================================

function getPurchaseOrders() {

    return purchaseOrders;

}


// ======================================================
// GET PURCHASE ORDER BY ID
// ======================================================

function getPurchaseOrderById(id) {

    return purchaseOrders.find(
        order => order.id === id
    );

}


module.exports = {

    createPurchaseOrder,

    getPurchaseOrders,

    getPurchaseOrderById

};