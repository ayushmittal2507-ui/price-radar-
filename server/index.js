import "dotenv/config";
import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";
import { startScheduler } from "./utils/scheduler.js";

// ── Initialise Express ────────────────────────
const app = express();

// ── Middleware ─────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Health check ──────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Future route mounts will go here ──────────
import authRoutes   from "./routes/auth.js";
import siteRoutes   from "./routes/site.js";
import trackRoutes  from "./routes/track.js";
import testRoutes   from "./routes/test.js";
//
app.use("/api/auth",   authRoutes);
app.use("/api/sites",  siteRoutes);
app.use("/api/site",   siteRoutes);
app.use("/api/track",  trackRoutes);
app.use("/api/tracks", trackRoutes);
app.use("/api/test",   testRoutes);

// ── Start server ──────────────────────────────
const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== "test") {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`🚀  PriceRadar API running → http://localhost:${PORT}`);
      startScheduler();
    });
  });
}

export default app; // exported for testing with Supertest
