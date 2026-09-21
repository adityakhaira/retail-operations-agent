const db = require("./db");

const products = db
    .prepare("SELECT * FROM products")
    .all();

const suppliers = db
    .prepare("SELECT * FROM suppliers")
    .all();

const sales = db
    .prepare("SELECT * FROM sales")
    .all();

console.log("\nPRODUCTS:");
console.table(products);

console.log("\nSUPPLIERS:");
console.table(suppliers);

console.log("\nSALES:");
console.table(sales);

const activities = db
    .prepare("SELECT * FROM activities")
    .all();

console.log("\nACTIVITIES:");
console.table(activities);

db.close();