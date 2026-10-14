const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const requestLogger = require("../middleware/requestLogger");
const { errorHandler, notFoundHandler } = require("../middleware/errorHandler");
const apiRoutes = require("./routes/api");
const userRoutes = require("./routes/userRoutes");
const caretakerRouter = require("./routes/caretakerRoutes");
const { flushOutbox } = require("./events/outbox");
const { asyncHandler } = require("./utils/AppError");

const app = express();

// Cloud Run sits behind a proxy; needed for correct client IPs (rate limiting)
app.set("trust proxy", 1);

// CLIENT_URL can be a comma-separated list. If it's not set, any origin is allowed (dev only).
const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins.length ? allowedOrigins : true, credentials: true }));
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());
app.use(requestLogger);

app.get("/healthz", (req, res) => {
  const dbUp = mongoose.connection.readyState === 1;
  res.status(dbUp ? 200 : 503).json({ status: dbUp ? "ok" : "db_unavailable" });
});

app.get("/from", (req, res) => {
  res.send("Hello from the api");
});

// Lets Cloud Scheduler retry unpublished events (see GCP_DEPLOYMENT_GUIDE.md).
// Disabled unless OUTBOX_FLUSH_TOKEN is set.
app.post(
  "/internal/outbox/flush",
  asyncHandler(async (req, res) => {
    const token = process.env.OUTBOX_FLUSH_TOKEN;
    if (!token || req.header("x-outbox-token") !== token) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Not found" } });
    }
    res.json(await flushOutbox());
  })
);

app.use("/api/v1", apiRoutes);

// Old endpoints still used by the current frontend. Remove after moving it to /api/v1.
app.use("/", userRoutes);
app.use("/", caretakerRouter);

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
