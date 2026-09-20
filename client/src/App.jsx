import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

function App() {
    const [inventory, setInventory] = useState([]);
    const [activities, setActivities] = useState([]);
    const [purchaseOrders, setPurchaseOrders] = useState([]);

    const [message, setMessage] = useState("");
    const [answer, setAnswer] = useState("");

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);

    // ==================================================
    // LOAD DASHBOARD DATA
    // ==================================================

    async function loadDashboard() {
        try {
            const [
                inventoryResponse,
                activityResponse,
                purchaseOrderResponse
            ] = await Promise.all([
                fetch("http://localhost:5000/api/inventory"),
                fetch("http://localhost:5000/api/activity"),
                fetch("http://localhost:5000/api/purchase-orders")
            ]);

            const inventoryData =
                await inventoryResponse.json();

            const activityData =
                await activityResponse.json();

            const purchaseOrderData =
                await purchaseOrderResponse.json();

            setInventory(inventoryData);

            setActivities(
                activityData.value || []
            );

            setPurchaseOrders(
                purchaseOrderData.purchaseOrders || []
            );
        } catch (error) {
            console.error(
                "Dashboard loading failed:",
                error
            );
        } finally {
            setLoadingData(false);
        }
    }

    // ==================================================
    // LOAD DATA WHEN PAGE OPENS
    // ==================================================

    useEffect(() => {
        loadDashboard();
    }, []);

    // ==================================================
    // ASK AI AGENT
    // ==================================================

    async function askAgent() {
        if (!message.trim()) {
            return;
        }

        setLoading(true);
        setAnswer("");

        try {
            const response = await fetch(
                "http://localhost:5000/api/agent",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message
                    })
                }
            );

            const data =
                await response.json();

            if (data.success) {
                setAnswer(data.answer);
            } else {
                setAnswer(
                    "Agent error: " + data.error
                );
            }
        } catch (error) {
            console.error(error);

            setAnswer(
                "Could not connect to backend."
            );
        }

        setLoading(false);

        loadDashboard();
    }

    // ==================================================
    // CREATE PURCHASE ORDER
    // ==================================================

    async function createPurchaseOrder() {
        try {
            const response = await fetch(
                "http://localhost:5000/api/purchase-orders",
                {
                    method: "POST"
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                alert(data.error);
                return;
            }

            await loadDashboard();

        } catch (error) {
            console.error(error);

            alert(
                "Failed to create purchase order."
            );
        }
    }

    // ==================================================
    // APPROVE PURCHASE ORDER
    // ==================================================

    async function approvePurchaseOrder(orderId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/purchase-orders/${orderId}/approve`,
                {
                    method: "POST"
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                alert(data.error);
                return;
            }

            await loadDashboard();

        } catch (error) {
            console.error(error);

            alert(
                "Failed to approve purchase order."
            );
        }
    }

    // ==================================================
    // REJECT PURCHASE ORDER
    // ==================================================

    async function rejectPurchaseOrder(orderId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/purchase-orders/${orderId}/reject`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        reason:
                            "Rejected by store owner"
                    })
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                alert(data.error);
                return;
            }

            await loadDashboard();

        } catch (error) {
            console.error(error);

            alert(
                "Failed to reject purchase order."
            );
        }
    }

    // ==================================================
    // EXECUTE PURCHASE ORDER
    // ==================================================

    async function executePurchaseOrder(orderId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/purchase-orders/${orderId}/execute`,
                {
                    method: "POST"
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                alert(data.error);
                return;
            }

            await loadDashboard();

        } catch (error) {
            console.error(error);

            alert(
                "Failed to execute purchase order."
            );
        }
    }

    // ==================================================
    // VERIFY PURCHASE ORDER
    // ==================================================

    async function verifyPurchaseOrder(orderId) {
        try {
            const response = await fetch(
                `http://localhost:5000/api/purchase-orders/${orderId}/verify`,
                {
                    method: "POST"
                }
            );

            const data =
                await response.json();

            if (!data.success) {
                alert(data.error);
                return;
            }

            await loadDashboard();

        } catch (error) {
            console.error(error);

            alert(
                "Failed to verify purchase order."
            );
        }
    }

    // ==================================================
    // DASHBOARD CALCULATIONS
    // ==================================================

    const lowStockProducts =
        inventory.filter(
            product =>
                product.stock <=
                product.reorderLevel
        );

    const pendingApprovals =
        purchaseOrders.filter(
            order =>
                order.status ===
                "PENDING_APPROVAL"
        );

    const totalProducts =
        inventory.length;

    // ==================================================
    // UI
    // ==================================================

    return (
        <div style={styles.app}>

            {/* HEADER */}

            <header style={styles.header}>

                <div>

                    <h1 style={styles.title}>
                        Retail Operations Agent
                    </h1>

                    <p style={styles.subtitle}>
                        AI-powered retail operations dashboard
                    </p>

                </div>

                <div style={styles.status}>
                    ● System Online
                </div>

            </header>

            {/* DASHBOARD CARDS */}

            <section style={styles.cards}>

                <div style={styles.card}>

                    <div style={styles.cardLabel}>
                        Total Products
                    </div>

                    <div style={styles.cardValue}>
                        {totalProducts}
                    </div>

                </div>

                <div style={styles.card}>

                    <div style={styles.cardLabel}>
                        Low Stock
                    </div>

                    <div style={styles.cardValue}>
                        {lowStockProducts.length}
                    </div>

                </div>

                <div style={styles.card}>

                    <div style={styles.cardLabel}>
                        Pending Approvals
                    </div>

                    <div style={styles.cardValue}>
                        {pendingApprovals.length}
                    </div>

                </div>

                <div style={styles.card}>

                    <div style={styles.cardLabel}>
                        Activity Events
                    </div>

                    <div style={styles.cardValue}>
                        {activities.length}
                    </div>

                </div>

            </section>

            <main style={styles.main}>

                {/* AI AGENT */}

                <section style={styles.section}>

                    <h2>
                        AI Operations Agent
                    </h2>

                    <p style={styles.description}>
                        Ask the agent about your store's
                        inventory, sales, suppliers or
                        reorder requirements.
                    </p>

                    <div style={styles.agentInput}>

                        <input
                            style={styles.input}
                            value={message}
                            onChange={e =>
                                setMessage(
                                    e.target.value
                                )
                            }
                            onKeyDown={e => {
                                if (
                                    e.key ===
                                    "Enter"
                                ) {
                                    askAgent();
                                }
                            }}
                            placeholder="e.g. What should I reorder?"
                        />

                        <button
                            style={styles.button}
                            onClick={askAgent}
                            disabled={loading}
                        >
                            {loading
                                ? "Thinking..."
                                : "Ask Agent"}
                        </button>

                    </div>

                    {answer && (
                        <div
                            style={
                                styles.answerBox
                            }
                        >

                            <h3>
                                Agent Response
                            </h3>

                            <div
                                style={
                                    styles.answer
                                }
                            >
                                <ReactMarkdown>
                                    {answer}
                                </ReactMarkdown>
                            </div>

                        </div>
                    )}

                </section>

                {/* INVENTORY */}

                <section style={styles.section}>

                    <h2>
                        Inventory
                    </h2>

                    <p style={styles.description}>
                        Current store inventory
                    </p>

                    {loadingData ? (

                        <p>
                            Loading inventory...
                        </p>

                    ) : (

                        <div
                            style={
                                styles.tableContainer
                            }
                        >

                            <table
                                style={
                                    styles.table
                                }
                            >

                                <thead>

                                    <tr>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Product
                                        </th>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Category
                                        </th>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Stock
                                        </th>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Reorder Level
                                        </th>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Status
                                        </th>

                                    </tr>

                                </thead>

                                <tbody>

                                    {inventory.map(
                                        product => (

                                            <tr
                                                key={
                                                    product.id
                                                }
                                            >

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {
                                                        product.name
                                                    }
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {
                                                        product.category
                                                    }
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {
                                                        product.stock
                                                    }
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >
                                                    {
                                                        product.reorderLevel
                                                    }
                                                </td>

                                                <td
                                                    style={
                                                        styles.td
                                                    }
                                                >

                                                    {product.stock <=
                                                    product.reorderLevel ? (

                                                        <span
                                                            style={
                                                                styles.lowStock
                                                            }
                                                        >
                                                            LOW STOCK
                                                        </span>

                                                    ) : (

                                                        <span
                                                            style={
                                                                styles.inStock
                                                            }
                                                        >
                                                            IN STOCK
                                                        </span>

                                                    )}

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </section>

                {/* PURCHASE ORDERS */}

                <section style={styles.section}>

                    <div
                        style={
                            styles.sectionHeader
                        }
                    >

                        <div>

                            <h2>
                                Purchase Orders
                            </h2>

                            <p
                                style={
                                    styles.description
                                }
                            >
                                Procurement actions generated
                                by the operations system.
                            </p>

                        </div>

                        <button
                            style={
                                styles.createButton
                            }
                            onClick={
                                createPurchaseOrder
                            }
                        >
                            Create Purchase Order
                        </button>

                    </div>

                    {purchaseOrders.length ===
                    0 ? (

                        <p>
                            No purchase orders yet.
                        </p>

                    ) : (

                        purchaseOrders.map(
                            order => (

                                <div
                                    key={order.id}
                                    style={
                                        styles.orderCard
                                    }
                                >

                                    <div
                                        style={
                                            styles.orderInformation
                                        }
                                    >

                                        <strong>
                                            {order.id}
                                        </strong>

                                        <p>
                                            {
                                                order.totalUnits
                                            } total units
                                        </p>

                                        {order.items &&
                                            order.items.map(
                                                item => (

                                                    <div
                                                        key={
                                                            item.productId
                                                        }
                                                        style={
                                                            styles.orderItem
                                                        }
                                                    >

                                                        <strong>
                                                            {
                                                                item.productName
                                                            }
                                                        </strong>

                                                        <div>
                                                            Quantity:{" "}
                                                            {
                                                                item.quantity
                                                            }
                                                        </div>

                                                        <div>
                                                            Supplier:{" "}
                                                            {
                                                                item.supplierName
                                                            }
                                                        </div>

                                                    </div>

                                                )
                                            )}

                                    </div>

                                    <div
                                        style={
                                            styles.orderActions
                                        }
                                    >

                                        <span
                                            style={
                                                styles.orderStatus
                                            }
                                        >
                                            {
                                                order.status
                                            }
                                        </span>

                                        {order.status ===
                                            "PENDING_APPROVAL" && (
                                            <>
                                                <button
                                                    style={
                                                        styles.approveButton
                                                    }
                                                    onClick={() =>
                                                        approvePurchaseOrder(
                                                            order.id
                                                        )
                                                    }
                                                >
                                                    Approve
                                                </button>

                                                <button
                                                    style={
                                                        styles.rejectButton
                                                    }
                                                    onClick={() =>
                                                        rejectPurchaseOrder(
                                                            order.id
                                                        )
                                                    }
                                                >
                                                    Reject
                                                </button>
                                            </>
                                        )}

                                        {order.status ===
                                            "APPROVED" && (
                                            <button
                                                style={
                                                    styles.executeButton
                                                }
                                                onClick={() =>
                                                    executePurchaseOrder(
                                                        order.id
                                                    )
                                                }
                                            >
                                                Execute
                                            </button>
                                        )}

                                        {order.status ===
                                            "EXECUTED" && (
                                            <button
                                                style={
                                                    styles.verifyButton
                                                }
                                                onClick={() =>
                                                    verifyPurchaseOrder(
                                                        order.id
                                                    )
                                                }
                                            >
                                                Verify
                                            </button>
                                        )}

                                    </div>

                                </div>

                            )
                        )

                    )}

                </section>

                {/* ACTIVITY */}

                <section style={styles.section}>

                    <h2>
                        Recent Agent Activity
                    </h2>

                    {activities.length === 0 ? (

                        <p>
                            No activity yet.
                        </p>

                    ) : (

                        activities
                            .slice()
                            .reverse()
                            .slice(0, 10)
                            .map(
                                activity => (

                                    <div
                                        key={
                                            activity.id
                                        }
                                        style={
                                            styles.activity
                                        }
                                    >

                                        <div>

                                            <strong>
                                                {
                                                    activity.type
                                                }
                                            </strong>

                                            <div
                                                style={
                                                    styles.activityDetails
                                                }
                                            >
                                                {
                                                    activity.purchaseOrderId ||
                                                    activity.tool ||
                                                    activity.userRequest ||
                                                    ""
                                                }
                                            </div>

                                        </div>

                                        <small>
                                            {new Date(
                                                activity.timestamp
                                            ).toLocaleString()}
                                        </small>

                                    </div>

                                )
                            )

                    )}

                </section>

            </main>

        </div>
    );
}


// ======================================================
// STYLES
// ======================================================

const styles = {

    app: {
        minHeight: "100vh",
        background: "#f5f7fb",
        color: "#1f2937",
        fontFamily:
            "Arial, Helvetica, sans-serif"
    },

    header: {
        background: "#111827",
        color: "white",
        padding: "24px 40px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },

    title: {
        margin: 0,
        fontSize: "28px"
    },

    subtitle: {
        margin: "6px 0 0",
        color: "#cbd5e1"
    },

    status: {
        color: "#86efac",
        fontWeight: "bold"
    },

    cards: {
        display: "grid",
        gridTemplateColumns:
            "repeat(4, 1fr)",
        gap: "20px",
        padding: "30px 40px"
    },

    card: {
        background: "white",
        borderRadius: "12px",
        padding: "22px",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.06)"
    },

    cardLabel: {
        color: "#6b7280",
        fontSize: "14px"
    },

    cardValue: {
        fontSize: "32px",
        fontWeight: "bold",
        marginTop: "8px"
    },

    main: {
        padding: "0 40px 40px",
        maxWidth: "1400px",
        margin: "auto"
    },

    section: {
        background: "white",
        borderRadius: "12px",
        padding: "25px",
        marginBottom: "25px",
        boxShadow:
            "0 2px 8px rgba(0,0,0,0.05)"
    },

    sectionHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px"
    },

    description: {
        color: "#6b7280"
    },

    agentInput: {
        display: "flex",
        gap: "10px",
        marginTop: "20px"
    },

    input: {
        flex: 1,
        padding: "13px",
        border:
            "1px solid #d1d5db",
        borderRadius: "8px",
        fontSize: "16px"
    },

    button: {
        padding: "13px 22px",
        border: "none",
        borderRadius: "8px",
        background: "#111827",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    createButton: {
        padding: "11px 18px",
        border: "none",
        borderRadius: "7px",
        background: "#111827",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    answerBox: {
        marginTop: "20px",
        padding: "18px",
        background: "#f3f4f6",
        borderRadius: "8px"
    },

    answer: {
        lineHeight: "1.6"
    },

    tableContainer: {
        overflowX: "auto"
    },

    table: {
        width: "100%",
        borderCollapse: "collapse"
    },

    th: {
        textAlign: "left",
        padding: "12px",
        borderBottom:
            "2px solid #e5e7eb"
    },

    td: {
        padding: "13px 12px",
        borderBottom:
            "1px solid #e5e7eb"
    },

    lowStock: {
        color: "#dc2626",
        fontWeight: "bold"
    },

    inStock: {
        color: "#16a34a",
        fontWeight: "bold"
    },

    orderCard: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        gap: "30px",
        padding: "18px",
        border:
            "1px solid #e5e7eb",
        borderRadius: "8px",
        marginTop: "12px"
    },

    orderInformation: {
        flex: 1
    },

    orderItem: {
        marginTop: "12px",
        padding: "10px",
        background: "#f9fafb",
        borderRadius: "6px"
    },

    orderActions: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        flexWrap: "wrap"
    },

    orderStatus: {
        fontWeight: "bold"
    },

    approveButton: {
        padding: "9px 14px",
        border: "none",
        borderRadius: "6px",
        background: "#16a34a",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    rejectButton: {
        padding: "9px 14px",
        border: "none",
        borderRadius: "6px",
        background: "#dc2626",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    executeButton: {
        padding: "9px 14px",
        border: "none",
        borderRadius: "6px",
        background: "#2563eb",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    verifyButton: {
        padding: "9px 14px",
        border: "none",
        borderRadius: "6px",
        background: "#7c3aed",
        color: "white",
        cursor: "pointer",
        fontWeight: "bold"
    },

    activity: {
        display: "flex",
        justifyContent: "space-between",
        padding: "14px 0",
        borderBottom:
            "1px solid #e5e7eb"
    },

    activityDetails: {
        color: "#6b7280",
        marginTop: "4px"
    }
};

export default App;