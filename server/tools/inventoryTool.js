const products = require("../data/products.json");

function getInventory() {
    return products;
}

function getLowStockProducts() {
    return products.filter(
        product => product.stock <= product.reorderLevel
    );
}

module.exports = {
    getInventory,
    getLowStockProducts
};