const db = require("../database/db");

function getSalesData() {
    return db
        .prepare(`
            SELECT
                product_id AS productId,
                units_sold_last_7_days AS unitsSoldLast7Days
            FROM sales
        `)
        .all();
}

function getSalesForProduct(productId) {
    return db
        .prepare(`
            SELECT
                product_id AS productId,
                units_sold_last_7_days AS unitsSoldLast7Days
            FROM sales
            WHERE product_id = ?
        `)
        .get(Number(productId));
}

module.exports = {
    getSalesData,
    getSalesForProduct
};