const express = require("express");
const pool = require("./db");
const fs = require("fs");
const auth = require("./auth");
const {
    isValidUPI,
    luhnCheck,
    getCardNetwork,
    isExpired,
} = require("./validate");

const app = express();
app.use(express.json());

async function initDB() {
    const schema = fs.readFileSync("./src/schema.sql").toString();
    await pool.query(schema);

    await pool.query(`
    INSERT INTO merchants (id, name, email, api_key, api_secret)
    VALUES (
      '550e8400-e29b-41d4-a716-446655440000',
      'Test Merchant',
      'test@example.com',
      'key_test_abc123',
      'secret_test_xyz789'
    )
    ON CONFLICT (email) DO NOTHING
  `);

    console.log("Database ready & test merchant seeded");
}

function generateOrderId() {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "order_";
    for (let i = 0; i < 16; i++) {
        id += chars[Math.floor(Math.random() * chars.length)];
    }
    return id;
}

app.get("/health", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({
            status: "healthy",
            database: "connected",
            timestamp: new Date().toISOString()
        });
    } catch (e) {
        res.json({
            status: "healthy",
            database: "disconnected",
            timestamp: new Date().toISOString()
        });
    }
});

app.post("/api/v1/orders", auth, async (req, res) => {
    const { amount, currency, receipt, notes } = req.body;

    if (!amount || amount < 100) {
        return res.status(400).json({
            error: {
                code: "BAD_REQUEST_ERROR",
                description: "amount must be at least 100"
            }
        });
    }

    const orderId = generateOrderId();

    await pool.query(
        `INSERT INTO orders 
     (id, merchant_id, amount, currency, receipt, notes, status)
     VALUES ($1,$2,$3,$4,$5,$6,'created')`,
        [
            orderId,
            req.merchant.id,
            amount,
            currency || "INR",
            receipt,
            notes || {}
        ]
    );

    res.status(201).json({
        id: orderId,
        merchant_id: req.merchant.id,
        amount,
        currency: currency || "INR",
        receipt,
        notes: notes || {},
        status: "created",
        created_at: new Date().toISOString()
    });
});

app.get("/api/v1/orders/:id", auth, async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
        [req.params.id, req.merchant.id]
    );

    if (result.rows.length === 0) {
        return res.status(404).json({
            error: {
                code: "NOT_FOUND_ERROR",
                description: "Order not found"
            }
        });
    }

    res.json(result.rows[0]);
});


// Create Payment Endpoint
app.post("/api/v1/payments", auth, async (req, res) => {
    const { order_id, method, vpa, card_number, exp_month, exp_year, cvv } = req.body;

    // Validate order exists
    const orderRes = await pool.query(
        "SELECT * FROM orders WHERE id=$1 AND merchant_id=$2",
        [order_id, req.merchant.id]
    );
    if (orderRes.rows.length === 0) {
        return res.status(404).json({
            error: { code: "ORDER_NOT_FOUND", description: "Order not found" },
        });
    }

    const amount = orderRes.rows[0].amount;

    // UPI Payment
    if (method === "UPI") {
        if (!vpa || !isValidUPI(vpa)) {
            return res.status(400).json({
                error: { code: "INVALID_UPI", description: "Invalid UPI VPA" },
            });
        }
    }

    // Card Payment
    if (method === "CARD") {
        if (!card_number || !luhnCheck(card_number)) {
            return res.status(400).json({
                error: { code: "INVALID_CARD", description: "Card failed Luhn check" },
            });
        }
        if (isExpired(exp_month, exp_year)) {
            return res.status(400).json({
                error: { code: "CARD_EXPIRED", description: "Card expired" },
            });
        }
    }

    const paymentId = `pay_${Math.random().toString(36).substr(2, 14)}`;

    // Insert payment with processing status
    await pool.query(
        `INSERT INTO payments (id, order_id, merchant_id, amount, currency, method, status, vpa, card_network, card_last4)
         VALUES ($1,$2,$3,$4,'INR',$5,'processing',$6,$7,$8)`,
        [
            paymentId,
            order_id,
            req.merchant.id,
            amount,
            method,
            method === "UPI" ? vpa : null,
            method === "CARD" ? getCardNetwork(card_number) : null,
            method === "CARD" ? card_number.slice(-4) : null,
        ]
    );

    res.status(201).json({
        id: paymentId,
        status: "processing",
        amount,
        method,
    });

    // Simulate bank delay + result
    const delay = process.env.TEST_PROCESSING_DELAY
        ? parseInt(process.env.TEST_PROCESSING_DELAY)
        : Math.floor(Math.random() * 5000) + 5000;

    setTimeout(async () => {
        const success =
            process.env.TEST_PAYMENT_SUCCESS === "true"
                ? true
                : Math.random() < 0.7;

        const status = success ? "success" : "failed";

        await pool.query(
            "UPDATE payments SET status=$1, updated_at=NOW() WHERE id=$2",
            [status, paymentId]
        );
    }, delay);
});

// Get Payment Status
app.get("/api/v1/payments/:id", auth, async (req, res) => {
    const result = await pool.query(
        "SELECT * FROM payments WHERE id=$1 AND merchant_id=$2",
        [req.params.id, req.merchant.id]
    );
    if (result.rows.length === 0) {
        return res.status(404).json({
            error: { code: "PAYMENT_NOT_FOUND", description: "Payment not found" },
        });
    }
    res.json(result.rows[0]);
});


app.listen(8000, async () => {
    await initDB();
    console.log("API running on port 8000");
});
