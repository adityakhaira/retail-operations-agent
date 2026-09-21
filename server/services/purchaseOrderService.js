const purchaseOrderTool = require("../tools/purchaseOrderTool");
const { logActivity } = require("../tools/activityLogTool");
const db = require("../database/db");

function executePurchaseOrder(orderId) {

    const order =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    if (!order) {
        throw new Error(
            `Purchase order ${orderId} was not found.`
        );
    }

    if (order.status !== "APPROVED") {
        throw new Error(
            `Purchase order must be APPROVED before execution. Current status: ${order.status}`
        );
    }

    const executedAt =
        new Date().toISOString();

    const executionReference =
        `SUPPLIER-ORDER-${Date.now()}`;

    db.prepare(`
        UPDATE purchase_orders
        SET
            status = ?,
            executed_at = ?,
            execution_reference = ?
        WHERE id = ?
    `).run(
        "EXECUTED",
        executedAt,
        executionReference,
        orderId
    );

    const updatedOrder =
        purchaseOrderTool.getPurchaseOrderById(orderId);

    logActivity({
        type: "purchase_order_executed",
        purchaseOrderId: orderId,
        executionReference: executionReference,
        status: "EXECUTED"
    });

    return updatedOrder;
}

module.exports = {
    executePurchaseOrder
};