import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "../.env") });
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import connectDB from "./config/db.js";
import { startScheduler } from "./utils/scheduler.js";
import dns from 'dns';

try {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
} catch {
  // Ignore DNS override errors if blocked by local network
}

// ── Initialise Express ────────────────────────
const app = express();

// ── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json());

// In serverless environments (e.g. Vercel), ensure DB connects on incoming requests
app.use(async (_req, _res, next) => {
  if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
    try {
      await connectDB();
    } catch {
      // Continue gracefully in showcase fallback mode
    }
  }
  next();
});

// ── Health check ──────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Future route mounts will go here ──────────
import authRoutes from "./routes/auth.js";
import siteRoutes from "./routes/site.js";
import trackRoutes from "./routes/track.js";
import testRoutes from "./routes/test.js";
//
app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/site", siteRoutes);
app.use("/api/track", trackRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/test", testRoutes);

// ── Start server ──────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, async () => {
    console.log(`🚀  PriceRadar API running → http://localhost:${PORT}`);
    try {
      await connectDB();
      if (!process.env.VERCEL) {
        startScheduler();
      }
    } catch (err) {
      console.warn("⚠️  Running in resilient showcase mode without live DB connection:", err.message);
    }
  });
}

export default app; // exported for testing with Supertest
