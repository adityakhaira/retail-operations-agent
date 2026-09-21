const db = require("../database/db");

function getInventory() {
    return db
        .prepare(`
            SELECT
                id,
                name,
                category,
                stock,
                price,
                reorderLevel
            FROM products
        `)
        .all();
}

function getLowStockProducts() {
    return db
        .prepare(`
            SELECT
                id,
                name,
                category,
                stock,
                price,
                reorderLevel
            FROM products
            WHERE stock <= reorderLevel
        `)
        .all();
}

module.exports = {
    getInventory,
    getLowStockProducts
};