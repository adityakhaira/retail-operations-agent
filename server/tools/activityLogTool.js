const db = require("../database/db");

function logActivity(activity) {

    const statement = db.prepare(`
        INSERT INTO activities
        (
            timestamp,
            type,
            purchase_order_id,
            tool,
            user_request,
            decision,
            reason,
            execution_reference,
            status,
            verification
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = statement.run(
        new Date().toISOString(),
        activity.type || null,
        activity.purchaseOrderId || null,
        activity.tool || null,
        activity.userRequest || null,
        activity.decision || null,
        activity.reason || null,
        activity.executionReference || null,
        activity.status || null,
        activity.verification
            ? JSON.stringify(activity.verification)
            : null
    );

    return {
        id: result.lastInsertRowid,
        timestamp: new Date().toISOString(),
        ...activity
    };
}

function getActivities() {

    const activities = db
        .prepare(`
            SELECT
                id,
                timestamp,
                type,
                purchase_order_id AS purchaseOrderId,
                tool,
                user_request AS userRequest,
                decision,
                reason,
                execution_reference AS executionReference,
                status,
                verification
            FROM activities
            ORDER BY id DESC
        `)
        .all();

    return activities.map(activity => ({
        ...activity,
        verification:
            activity.verification
                ? JSON.parse(activity.verification)
                : null
    }));
}

module.exports = {
    logActivity,
    getActivities
};