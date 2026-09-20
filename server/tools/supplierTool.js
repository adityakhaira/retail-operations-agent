const suppliers = require("../data/suppliers.json");

function getSuppliers() {
    return suppliers;
}

function getSupplierForProduct(productId) {
    return suppliers.find(
        supplier => supplier.products.includes(Number(productId))
    );
}

module.exports = {
    getSuppliers,
    getSupplierForProduct
};