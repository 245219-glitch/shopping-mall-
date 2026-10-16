/* =========================================================
   Coco's Mall – Express backend (Lab 05, Question 3)
   GET  /api/products          -> predefined JSON product list
   GET  /api/products/:id      -> one product
   POST /api/configurations    -> receive a product configuration (JSON body)
   GET  /api/configurations    -> list the configurations received so far
   Middleware: custom request logger, cors(), express.json()
   Data now lives in MySQL (XAMPP, database "coco_mall") - import database.sql first
   ========================================================= */
const express = require("express");
const cors = require("cors");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

/* MySQL connection (XAMPP defaults: user root, no password, port 3306) */
const pool = mysql.createPool({
  host: "127.0.0.1",
  port: 3306,
  user: "root",
  password: "",
  database: "coco_mall",
  charset: "utf8mb4",
  decimalNumbers: true,
  waitForConnections: true,
  connectionLimit: 10
});

/* turn one products row into the same JSON shape the frontend already uses */
function toProduct(r) {
  return {
    id: r.id, name: r.name, emoji: r.emoji, category: r.category, price: r.price, description: r.description,
    colors: r.colors.split(","), sizes: r.sizes.split(","),
    engravable: !!r.engravable,
    ...(r.engravable ? { engraveStyle: r.engrave_style, engraveHint: r.engrave_hint } : {})
  };
}

/* serve the frontend (so http://localhost:3000 opens the mall) */
app.use(express.static(path.join(__dirname, "public")));

/* ---- 1. CUSTOM MIDDLEWARE: observe the HTTP method + requested URL ---- */
function requestLogger(req, res, next) {
  const started = Date.now();
  console.log("\n➡️  " + new Date().toLocaleTimeString() + "  " + req.method + " " + req.originalUrl);
  res.on("finish", () => console.log("⬅️  " + res.statusCode + " " + req.method + " " + req.originalUrl + "  (" + (Date.now() - started) + " ms)"));
  next();                                            // hand over to the next middleware / route
}
app.use(requestLogger);

/* ---- 2. CORS: lets the page on another port (e.g. Live Server :5500) call this API ---- */
app.use(cors());

/* ---- 3. BUILT-IN MIDDLEWARE: parse JSON request bodies into req.body (must come before the POST routes) ---- */
app.use(express.json());

/* log the parsed body for POST requests (second small custom middleware) */
app.use((req, res, next) => {
  if (req.method === "POST") console.log("📦 Request body:", JSON.stringify(req.body));
  next();
});

/* ---------------- GET: product information (from MySQL) ---------------- */
app.get("/api/products", async (req, res) => {
  try {
    const { category } = req.query;
    const [rows] = category
      ? await pool.execute("SELECT * FROM products WHERE LOWER(category) = LOWER(?) ORDER BY id", [String(category)])
      : await pool.execute("SELECT * FROM products ORDER BY id");
    const list = rows.map(toProduct);
    res.json({ success: true, count: list.length, source: "Coco's Mall Express server (MySQL)", products: list });
  } catch (err) {
    console.error("GET /api/products failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load products from the database." });
  }
});

app.get("/api/products/:id", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM products WHERE id = ?", [Number(req.params.id)]);
    if (!rows.length) return res.status(404).json({ success: false, message: "Product " + req.params.id + " not found." });
    res.json({ success: true, product: toProduct(rows[0]) });
  } catch (err) {
    console.error("GET /api/products/:id failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load the product from the database." });
  }
});

/* ---------------- POST: submit a product configuration (saved in MySQL) ---------------- */
app.post("/api/configurations", async (req, res) => {
  const { productName, color, size, engraving, font, price } = req.body || {};
  const problems = [];
  if (!productName || typeof productName !== "string") problems.push("productName is required");
  if (!color) problems.push("color is required");
  if (!size) problems.push("size is required");
  if (engraving && String(engraving).length > 16) problems.push("engraving must be 16 characters or fewer");
  if (price !== undefined && (typeof price !== "number" || price < 0)) problems.push("price must be a positive number");
  if (problems.length) return res.status(400).json({ success: false, message: "Invalid configuration.", problems });

  try {
    const [result] = await pool.execute(
      "INSERT INTO configurations (product_name, color, size, engraving, font, price) VALUES (?, ?, ?, ?, ?, ?)",
      [productName, String(color), String(size), engraving || "", font || "classic", price ?? null]
    );
    const [count] = await pool.execute("SELECT COUNT(*) AS total FROM configurations");
    const config = {
      configId: "CFG-" + String(result.insertId).padStart(4, "0"),
      productName, color, size, engraving: engraving || "", font: font || "classic", price: price ?? null,
      receivedAt: new Date().toISOString()
    };
    console.log("✅ Saved configuration " + config.configId + " for " + productName);
    res.status(201).json({
      success: true,
      message: "Configuration received for “" + productName + "”.",
      summary: color + " · " + size + (config.engraving ? " · engraved “" + config.engraving + "”" : " · no engraving"),
      config,
      totalSaved: count[0].total
    });
  } catch (err) {
    console.error("POST /api/configurations failed:", err.message);
    res.status(500).json({ success: false, message: "Could not save the configuration to the database." });
  }
});

app.get("/api/configurations", async (req, res) => {
  try {
    const [rows] = await pool.execute("SELECT * FROM configurations ORDER BY id");
    const configurations = rows.map(r => ({
      configId: "CFG-" + String(r.id).padStart(4, "0"),
      productName: r.product_name, color: r.color, size: r.size, engraving: r.engraving, font: r.font,
      price: r.price, receivedAt: new Date(r.received_at).toISOString()
    }));
    res.json({ success: true, count: configurations.length, configurations });
  } catch (err) {
    console.error("GET /api/configurations failed:", err.message);
    res.status(500).json({ success: false, message: "Could not load configurations from the database." });
  }
});

/* ---- unknown API routes + bad JSON ---- */
app.use("/api", (req, res) => res.status(404).json({ success: false, message: "Unknown API route: " + req.method + " " + req.originalUrl }));
app.use((err, req, res, next) => {
  console.log("❌ " + err.message);
  res.status(err.status || 500).json({ success: false, message: err.type === "entity.parse.failed" ? "Request body is not valid JSON." : err.message });
});

app.listen(PORT, () => console.log("☕ Coco's Mall server running → http://localhost:" + PORT));
