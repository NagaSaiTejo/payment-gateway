const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
async function authMiddleware(req, res, next) {
  const apiKey = req.header("X-Api-Key");
  const apiSecret = req.header("X-Api-Secret");
  if (!apiKey || !apiSecret) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }
  const result = await pool.query(
    "SELECT * FROM merchants WHERE api_key=$1 AND api_secret=$2",
    [apiKey, apiSecret]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({
      error: {
        code: "AUTHENTICATION_ERROR",
        description: "Invalid API credentials"
      }
    });
  }
  req.merchant = result.rows[0]; // attach merchant to request
  next();
}
module.exports = authMiddleware;