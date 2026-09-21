const purchaseOrderTool = require("../tools/purchaseOrderTool");
const { logActivity } = require("../tools/activityLogTool");
const db = require("../database/db");

function verifyPurchaseOrder(orderId) {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    if (!order) {
        throw new Error(
            `Purchase order ${orderId} was not found.`
        );
    }

    if (order.status !== "EXECUTED") {
        throw new Error(
            `Purchase order must be EXECUTED before verification. Current status: ${order.status}`
        );
    }

    const verifiedAt =
        new Date().toISOString();

    db.prepare(`
        UPDATE purchase_orders
        SET
            status = ?,
            verified_at = ?
        WHERE id = ?
    `).run(
        "VERIFIED",
        verifiedAt,
        orderId
    );

    const verification = {
        success: true,
        message:
            "Purchase order execution was successfully verified."
    };

    const updatedOrder =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    logActivity({
        type: "purchase_order_verified",
        purchaseOrderId: orderId,
        status: "VERIFIED",
        verification: verification
    });

    return {
        ...updatedOrder,
        verification: verification
    };
}

module.exports = {
    verifyPurchaseOrder
};