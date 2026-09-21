const db = require("../database/db");

function getSuppliers() {
    return db
        .prepare(`
            SELECT
                id,
                name,
                contact
            FROM suppliers
        `)
        .all();
}

function getSupplierForProduct(productId) {
    return db
        .prepare(`
            SELECT
                s.id,
                s.name,
                s.contact
            FROM suppliers s
            INNER JOIN supplier_products sp
                ON s.id = sp.supplier_id
            WHERE sp.product_id = ?
        `)
        .get(Number(productId));
}

module.exports = {
    getSuppliers,
    getSupplierForProduct
};