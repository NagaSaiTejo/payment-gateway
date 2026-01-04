const express = require("express");
const { Pool } = require("pg");
const fs = require("fs");
const auth = require("./auth");

const app = express();
app.use(express.json());

const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

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


app.listen(8000, async () => {
    await initDB();
    console.log("API running on port 8000");
});
