/**
 * NPS IntelliPension AI — Backend Server
 * Node.js + Express.js
 */
require("dotenv").config();
console.log("API KEY:", process.env.ANTHROPIC_API_KEY);

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const simulationRoutes = require("./routes/simulation");
const chatRoutes = require("./routes/chat");
const authRoutes = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Security Middleware ───────────────────────
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));

// ─── Rate Limiting ─────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api/", limiter);

// ─── Body Parsing ──────────────────────────────
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// ─── Routes ────────────────────────────────────
app.use("/api/simulation", simulationRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/auth", authRoutes);

// ─── Health Check ──────────────────────────────
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    service: "NPS IntelliPension AI",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// ─── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ─── Global Error Handler ──────────────────────
app.use((err, req, res, next) => {
  console.error("Server Error:", err.message);
  res.status(err.status || 500).json({
    error: err.message || "Internal server error",
    disclaimer: "Please contact support or verify with PFRDA official sources.",
  });
});

// ─── Start Server ──────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ NPS IntelliPension AI Backend running on port ${PORT}`);
  console.log(`📡 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
