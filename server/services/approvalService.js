const purchaseOrderTool = require("../tools/purchaseOrderTool");
const { logActivity } = require("../tools/activityLogTool");

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

    const db = require("../database/db");

    db.prepare(`
        UPDATE purchase_orders
        SET
            status = ?,
            approved_at = ?
        WHERE id = ?
    `).run(
        "APPROVED",
        new Date().toISOString(),
        orderId
    );

    const updatedOrder =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    logActivity({
        type: "purchase_order_approved",
        purchaseOrderId: orderId,
        status: "APPROVED"
    });

    return updatedOrder;
}

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

    const db = require("../database/db");

    db.prepare(`
        UPDATE purchase_orders
        SET
            status = ?,
            rejected_at = ?,
            rejection_reason = ?
        WHERE id = ?
    `).run(
        "REJECTED",
        new Date().toISOString(),
        reason || "No reason provided",
        orderId
    );

    const updatedOrder =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    logActivity({
        type: "purchase_order_rejected",
        purchaseOrderId: orderId,
        reason: reason || "No reason provided",
        status: "REJECTED"
    });

    return updatedOrder;
}

module.exports = {
    approvePurchaseOrder,
    rejectPurchaseOrder
};