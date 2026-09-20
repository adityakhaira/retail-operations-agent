const purchaseOrderTool = require("../tools/purchaseOrderTool");

const {
    logActivity
} = require("../tools/activityLogTool");


// ======================================================
// EXECUTE PURCHASE ORDER
// ======================================================

function executePurchaseOrder(orderId) {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);


    if (!order) {

        throw new Error(
            `Purchase order ${orderId} was not found.`
        );

    }


    // IMPORTANT:
    // Only approved orders can be executed.

    if (order.status !== "APPROVED") {

        throw new Error(
            `Purchase order must be APPROVED before execution. Current status: ${order.status}`
        );

    }


    // --------------------------------------------------
    // Simulated execution
    // --------------------------------------------------
    //
    // In a real system this could call:
    //
    // - supplier API
    // - procurement system
    // - ERP
    // - email/WhatsApp
    //
    // For our project we simulate the action.
    // --------------------------------------------------

    order.status = "EXECUTED";

    order.executedAt =
        new Date().toISOString();


    order.executionReference =
        `SUPPLIER-ORDER-${Date.now()}`;


    logActivity({

        type:
            "purchase_order_executed",

        purchaseOrderId:
            order.id,

        executionReference:
            order.executionReference,

        status:
            order.status

    });


    return order;
}


module.exports = {

    executePurchaseOrder

};