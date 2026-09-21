const db = require("../database/db");
const reorderTool = require("./reorderTool");

function createPurchaseOrder() {

    const recommendations =
        reorderTool.getReorderRecommendations();

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

    if (items.length === 0) {
        return {
            success: true,
            message:
                "No products currently require reordering.",
            purchaseOrder: null
        };
    }

    const totalUnits = items.reduce(
        (total, item) => total + item.quantity,
        0
    );

    const purchaseOrder = {
        id: `PO-${Date.now()}`,
        status: "PENDING_APPROVAL",
        createdAt: new Date().toISOString(),
        items: items,
        totalUnits: totalUnits
    };

    const insertOrder = db.prepare(`
        INSERT INTO purchase_orders
        (
            id,
            status,
            created_at
        )
        VALUES (?, ?, ?)
    `);

    const insertItem = db.prepare(`
        INSERT INTO purchase_order_items
        (
            purchase_order_id,
            product_id,
            product_name,
            quantity,
            supplier_id,
            supplier_name,
            supplier_contact
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {

        insertOrder.run(
            purchaseOrder.id,
            purchaseOrder.status,
            purchaseOrder.createdAt
        );

        for (const item of items) {

            insertItem.run(
                purchaseOrder.id,
                item.productId,
                item.productName,
                item.quantity,
                item.supplierId,
                item.supplierName,
                item.supplierContact
            );
        }
    });

    transaction();

    return {
        success: true,
        message:
            "Purchase order draft created and is waiting for approval.",
        purchaseOrder: purchaseOrder
    };
}

function getPurchaseOrders() {

    const orders = db
        .prepare(`
            SELECT *
            FROM purchase_orders
            ORDER BY created_at DESC
        `)
        .all();

    for (const order of orders) {

        order.createdAt = order.created_at;
        order.approvedAt = order.approved_at;
        order.rejectedAt = order.rejected_at;
        order.rejectionReason = order.rejection_reason;
        order.executedAt = order.executed_at;
        order.executionReference =
            order.execution_reference;
        order.verifiedAt = order.verified_at;

        const items = db
            .prepare(`
                SELECT
                    product_id AS productId,
                    product_name AS productName,
                    quantity,
                    supplier_id AS supplierId,
                    supplier_name AS supplierName,
                    supplier_contact AS supplierContact
                FROM purchase_order_items
                WHERE purchase_order_id = ?
            `)
            .all(order.id);

        order.items = items;

        order.totalUnits = items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        );

        delete order.created_at;
        delete order.approved_at;
        delete order.rejected_at;
        delete order.rejection_reason;
        delete order.executed_at;
        delete order.execution_reference;
        delete order.verified_at;
    }

    return orders;
}

function getPurchaseOrderById(id) {

    const order = db
        .prepare(`
            SELECT *
            FROM purchase_orders
            WHERE id = ?
        `)
        .get(id);

    if (!order) {
        return undefined;
    }

    const items = db
        .prepare(`
            SELECT
                product_id AS productId,
                product_name AS productName,
                quantity,
                supplier_id AS supplierId,
                supplier_name AS supplierName,
                supplier_contact AS supplierContact
            FROM purchase_order_items
            WHERE purchase_order_id = ?
        `)
        .all(id);

    return {
        id: order.id,
        status: order.status,
        createdAt: order.created_at,
        approvedAt: order.approved_at,
        rejectedAt: order.rejected_at,
        rejectionReason: order.rejection_reason,
        executedAt: order.executed_at,
        executionReference:
            order.execution_reference,
        verifiedAt: order.verified_at,
        items: items,
        totalUnits: items.reduce(
            (total, item) =>
                total + item.quantity,
            0
        )
    };
}

module.exports = {
    createPurchaseOrder,
    getPurchaseOrders,
    getPurchaseOrderById
};