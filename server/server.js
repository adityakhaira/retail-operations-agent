const path = require("path");

require("dotenv").config({
    path: path.join(__dirname, ".env")
});
console.log(
    "Gemini API key loaded:",
    Boolean(process.env.GEMINI_API_KEY)
);


const express = require("express");
const cors = require("cors");


// ======================================================
// TOOLS
// ======================================================

const inventoryTool = require("./tools/inventoryTool");
const reorderTool = require("./tools/reorderTool");
const purchaseOrderTool = require("./tools/purchaseOrderTool");


// ======================================================
// AI SERVICES
// ======================================================

const { askGemini } = require("./services/gemini");


// ======================================================
// AGENT
// ======================================================

const { runAgent } = require("./agent/agent");


// ======================================================
// ACTIVITY LOG
// ======================================================

const {
    getActivities
} = require("./tools/activityLogTool");


// ======================================================
// APPROVAL SERVICE
// ======================================================

const {
    approvePurchaseOrder,
    rejectPurchaseOrder
} = require("./services/approvalService");


// ======================================================
// PURCHASE ORDER SERVICE
// ======================================================

const {
    executePurchaseOrder
} = require("./services/purchaseOrderService");


// ======================================================
// VERIFICATION SERVICE
// ======================================================

const {
    verifyPurchaseOrder
} = require("./services/verificationService");


// ======================================================
// EXPRESS APP
// ======================================================

const app = express();


// ======================================================
// MIDDLEWARE
// ======================================================

app.use(cors());

app.use(express.json());


// ======================================================
// BASIC BACKEND TEST
// ======================================================

app.get("/", (req, res) => {

    res.json({
        message:
            "Retail Operations Agent backend is running!"
    });

});


// ======================================================
// BACKEND STATUS
// ======================================================

app.get("/api/status", (req, res) => {

    res.json({

        status: "online",

        message:
            "Backend successfully connected to the frontend."

    });

});


// ======================================================
// GET ALL INVENTORY
// ======================================================

app.get("/api/inventory", (req, res) => {

    try {

        const inventory =
            inventoryTool.getInventory();

        res.json(inventory);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            error:
                "Failed to retrieve inventory."

        });

    }

});


// ======================================================
// GET LOW-STOCK PRODUCTS
// ======================================================

app.get("/api/inventory/low-stock", (req, res) => {

    try {

        const lowStock =
            inventoryTool.getLowStockProducts();

        res.json(lowStock);

    } catch (error) {

        console.error(error);

        res.status(500).json({

            success: false,

            error:
                "Failed to retrieve low-stock products."

        });

    }

});


// ======================================================
// GEMINI AI TEST
// ======================================================

app.get("/api/ai-test", async (req, res) => {

    try {

        const answer = await askGemini(
            "Explain in one simple sentence what inventory management means."
        );

        res.json({

            success: true,

            answer: answer

        });

    } catch (error) {

        console.error(
            "========== GEMINI TEST ERROR =========="
        );

        console.error(error);

        console.error(
            "======================================="
        );

        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Gemini request failed."

        });

    }

});


// ======================================================
// AI AGENT
// ======================================================

app.post("/api/agent", async (req, res) => {

    try {

        const {
            message
        } = req.body;


        // Validate message

        if (!message || !message.trim()) {

            return res.status(400).json({

                success: false,

                error:
                    "Message is required."

            });

        }


        console.log(
            `Agent request: ${message}`
        );


        const answer =
            await runAgent(message);


        res.json({

            success: true,

            answer: answer

        });

    } catch (error) {

        console.error(
            "========== AGENT ERROR =========="
        );

        console.error(error);

        console.error(
            "================================="
        );


        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Agent request failed."

        });

    }

});


// ======================================================
// REORDER RECOMMENDATIONS
// ======================================================

app.get("/api/reorder", (req, res) => {

    try {

        const recommendations =
            reorderTool.getReorderRecommendations();


        res.json({

            success: true,

            recommendations:
                recommendations

        });

    } catch (error) {

        console.error(
            "Reorder calculation failed:"
        );

        console.error(error);


        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Failed to calculate reorder recommendations."

        });

    }

});


// ======================================================
// CREATE PURCHASE ORDER DRAFT
// ======================================================

app.post("/api/purchase-orders", (req, res) => {

    try {

        const result =
            purchaseOrderTool.createPurchaseOrder();


        res.json(result);

    } catch (error) {

        console.error(
            "Purchase order creation failed:"
        );

        console.error(error);


        res.status(500).json({

            success: false,

            error:
                error.message ||
                "Failed to create purchase order."

        });

    }

});


// ======================================================
// GET ALL PURCHASE ORDERS
// ======================================================

app.get("/api/purchase-orders", (req, res) => {

    try {

        const orders =
            purchaseOrderTool.getPurchaseOrders();


        res.json({

            success: true,

            purchaseOrders:
                orders

        });

    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            error:
                "Failed to retrieve purchase orders."

        });

    }

});


// ======================================================
// APPROVE PURCHASE ORDER
// ======================================================

app.post(
    "/api/purchase-orders/:id/approve",
    (req, res) => {

        try {

            const order =
                approvePurchaseOrder(
                    req.params.id
                );


            res.json({

                success: true,

                message:
                    "Purchase order approved successfully.",

                purchaseOrder:
                    order

            });

        } catch (error) {

            console.error(error);


            res.status(400).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// REJECT PURCHASE ORDER
// ======================================================

app.post(
    "/api/purchase-orders/:id/reject",
    (req, res) => {

        try {

            const reason =
                req.body.reason || "";


            const order =
                rejectPurchaseOrder(
                    req.params.id,
                    reason
                );


            res.json({

                success: true,

                message:
                    "Purchase order rejected.",

                purchaseOrder:
                    order

            });

        } catch (error) {

            console.error(error);


            res.status(400).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// EXECUTE PURCHASE ORDER
// ======================================================

app.post(
    "/api/purchase-orders/:id/execute",
    (req, res) => {

        try {

            const order =
                executePurchaseOrder(
                    req.params.id
                );


            res.json({

                success: true,

                message:
                    "Purchase order executed successfully.",

                purchaseOrder:
                    order

            });

        } catch (error) {

            console.error(error);


            res.status(400).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// VERIFY PURCHASE ORDER
// ======================================================

app.post(
    "/api/purchase-orders/:id/verify",
    (req, res) => {

        try {

            const order =
                verifyPurchaseOrder(
                    req.params.id
                );


            res.json({

                success: true,

                message:
                    "Purchase order verified successfully.",

                purchaseOrder:
                    order

            });

        } catch (error) {

            console.error(error);


            res.status(400).json({

                success: false,

                error:
                    error.message

            });

        }

    }
);


// ======================================================
// AGENT ACTIVITY LOG
// ======================================================

app.get("/api/activity", (req, res) => {

    try {

        const activities =
            getActivities();


        res.json(activities);

    } catch (error) {

        console.error(error);


        res.status(500).json({

            success: false,

            error:
                "Failed to retrieve activity log."

        });

    }

});


// ======================================================
// START SERVER
// ======================================================

const PORT = 5000;


app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});