const purchaseOrderTool = require("../tools/purchaseOrderTool");
const { logActivity } = require("../tools/activityLogTool");


// ======================================================
// APPROVE PURCHASE ORDER
// ======================================================

function approvePurchaseOrder(orderId) {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);


    if (!order) {

        throw new Error(
            `Purchase order ${orderId} was not found.`
        );

    }


    if (order.status !== "PENDING_APPROVAL") {

        throw new Error(
            `Purchase order ${orderId} is not pending approval.`
        );

    }


    order.status = "APPROVED";

    order.approvedAt =
        new Date().toISOString();


    logActivity({

        type: "purchase_order_approved",

        purchaseOrderId:
            order.id,

        status:
            order.status

    });


    return order;
}


// ======================================================
// REJECT PURCHASE ORDER
// ======================================================

function rejectPurchaseOrder(orderId, reason = "") {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);


    if (!order) {

        throw new Error(
            `Purchase order ${orderId} was not found.`
        );

    }


    if (order.status !== "PENDING_APPROVAL") {

        throw new Error(
            `Purchase order ${orderId} is not pending approval.`
        );

    }


    order.status = "REJECTED";

    order.rejectedAt =
        new Date().toISOString();

    order.rejectionReason =
        reason || "No reason provided";


    logActivity({

        type: "purchase_order_rejected",

        purchaseOrderId:
            order.id,

        reason:
            order.rejectionReason,

        status:
            order.status

    });


    return order;
}


module.exports = {

    approvePurchaseOrder,

    rejectPurchaseOrder

};