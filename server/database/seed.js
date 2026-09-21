const db = require("./db");

const products = require("../data/products.json");
const suppliers = require("../data/suppliers.json");
const sales = require("../data/sales.json");

console.log("Seeding database...");

const insertProduct = db.prepare(`
    INSERT OR REPLACE INTO products
    (id, name, category, stock, price, reorderLevel)
    VALUES (?, ?, ?, ?, ?, ?)
`);

const insertSupplier = db.prepare(`
    INSERT OR REPLACE INTO suppliers
    (id, name, contact)
    VALUES (?, ?, ?)
`);

const insertSupplierProduct = db.prepare(`
    INSERT OR REPLACE INTO supplier_products
    (supplier_id, product_id)
    VALUES (?, ?)
`);

const insertSale = db.prepare(`
    INSERT INTO sales
    (product_id, units_sold_last_7_days)
    VALUES (?, ?)
`);

const seedDatabase = db.transaction(() => {

    // Products
    for (const product of products) {
        insertProduct.run(
            product.id,
            product.name,
            product.category,
            product.stock,
            product.price,
            product.reorderLevel
        );
    }

    // Suppliers + supplier-product relationships
    for (const supplier of suppliers) {

        insertSupplier.run(
            supplier.id,
            supplier.name,
            supplier.contact
        );

        for (const productId of supplier.products) {
            insertSupplierProduct.run(
                supplier.id,
                productId
            );
        }
    }

    // Sales
    for (const sale of sales) {
        insertSale.run(
            sale.productId,
            sale.unitsSoldLast7Days
        );
    }
});

try {
    seedDatabase();

    console.log("Database seeded successfully.");

} catch (error) {

    console.error("Database seeding failed:");
    console.error(error);

} finally {

    db.close();
}