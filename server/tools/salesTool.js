const sales = require("../data/sales.json");

function getSalesData() {
    return sales;
}

function getSalesForProduct(productId) {
    return sales.find(
        sale => sale.productId === Number(productId)
    );
}

module.exports = {
    getSalesData,
    getSalesForProduct
};