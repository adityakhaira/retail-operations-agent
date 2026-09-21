const fs = require("fs");
const path = require("path");

const policiesDirectory =
    path.join(__dirname, "../data/policies");

const policyFiles = {
    reorder: "reorder-policy.txt",
    supplier: "supplier-policy.txt",
    discount: "discount-policy.txt",
    return: "return-policy.txt"
};

function loadPolicy(policyName) {
    const fileName =
        policyFiles[policyName];

    if (!fileName) {
        throw new Error(
            `Unknown policy: ${policyName}`
        );
    }

    const filePath =
        path.join(
            policiesDirectory,
            fileName
        );

    return fs.readFileSync(
        filePath,
        "utf8"
    );
}

function searchPolicies(query) {
    const text =
        query.toLowerCase();

    const results = [];

    if (
        text.includes("reorder") ||
        text.includes("restock") ||
        text.includes("stock") ||
        text.includes("inventory")
    ) {
        results.push({
            policy: "reorder",
            content:
                loadPolicy("reorder")
        });
    }

    if (
        text.includes("supplier") ||
        text.includes("vendor")
    ) {
        results.push({
            policy: "supplier",
            content:
                loadPolicy("supplier")
        });
    }

    if (
        text.includes("discount") ||
        text.includes("offer") ||
        text.includes("promotion")
    ) {
        results.push({
            policy: "discount",
            content:
                loadPolicy("discount")
        });
    }

    if (
        text.includes("return") ||
        text.includes("refund")
    ) {
        results.push({
            policy: "return",
            content:
                loadPolicy("return")
        });
    }

    return results;
}

module.exports = {
    loadPolicy,
    searchPolicies
};