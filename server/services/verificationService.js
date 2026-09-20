const purchaseOrderTool = require("../tools/purchaseOrderTool");

const {
    logActivity
} = require("../tools/activityLogTool");


// ======================================================
// VERIFY PURCHASE ORDER
// ======================================================

function verifyPurchaseOrder(orderId) {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);


    if (!order) {

        throw new Error(
            `Purchase order ${orderId} was not found.`
        );

    }


    // --------------------------------------------------
    // We can only verify an executed order
    // --------------------------------------------------

    if (order.status !== "EXECUTED") {

        throw new Error(
            `Purchase order must be EXECUTED before verification.`
        );

    }


    // --------------------------------------------------
    // Simulated verification
    // --------------------------------------------------

    order.status = "VERIFIED";

    order.verifiedAt =
        new Date().toISOString();


    order.verification = {

        success: true,

        message:
            "Purchase order execution was successfully verified."

    };


    logActivity({

        type:
            "purchase_order_verified",

        purchaseOrderId:
            order.id,

        status:
            order.status,

        verification:
            order.verification

    });


    return order;
}


module.exports = {

    verifyPurchaseOrder

};