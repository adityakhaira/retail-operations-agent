const inventoryTool = require("./inventoryTool");
const salesTool = require("./salesTool");
const supplierTool = require("./supplierTool");

function getReorderRecommendations() {

    const inventory = inventoryTool.getInventory();
    const sales = salesTool.getSalesData();
    const suppliers = supplierTool.getSuppliers();

    const recommendations = [];

    for (const product of inventory) {

        // Find sales information
        const saleData = sales.find(
            sale => sale.productId === product.id
        );

        const unitsSoldLast7Days = saleData
            ? saleData.unitsSoldLast7Days
            : 0;

        // Average daily sales
        const averageDailySales =
            unitsSoldLast7Days / 7;

        // Expected demand for next 7 days
        const expected7DayDemand =
            Math.ceil(averageDailySales * 7);

        // Find supplier
        const supplier = suppliers.find(
            supplier =>
                supplier.products.includes(product.id)
        );

        // Calculate recommended reorder quantity
        const recommendedQuantity =
            Math.max(
                0,
                expected7DayDemand - product.stock
            );

        // Product needs attention if stock is below
        // expected 7-day demand
        const needsReorder =
            product.stock < expected7DayDemand;

        recommendations.push({

            productId: product.id,

            productName: product.name,

            currentStock: product.stock,

            reorderLevel: product.reorderLevel,

            unitsSoldLast7Days: unitsSoldLast7Days,

            averageDailySales:
                Number(averageDailySales.toFixed(2)),

            expected7DayDemand:
                expected7DayDemand,

            recommendedQuantity:
                recommendedQuantity,

            needsReorder:
                needsReorder,

            supplier: supplier
                ? {
                    id: supplier.id,
                    name: supplier.name,
                    contact: supplier.contact
                }
                : null

        });
    }

    return recommendations;
}


module.exports = {
    getReorderRecommendations
};