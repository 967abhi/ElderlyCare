// Load .env before anything reads process.env
require("dotenv").config();

const logger = require("./config/logger");
const connectDB = require("./config/db");
const app = require("./src/app");
const { startOutboxWorker } = require("./src/events/outbox");

// Cloud Run sets PORT (8080). Locally it comes from .env or defaults to 3000.
const port = process.env.PORT || 3000;

const required = ["MONGO_URI", "JWT_SECRET"];
const missing = required.filter((key) => !process.env[key]);
if (missing.length) {
  logger.error("missing required environment variables", { missing });
  process.exit(1);
}

connectDB()
  .then(() => {
    logger.info("database is connected");
    const server = app.listen(port, () => {
      logger.info(`server is running on the ${port}`, { port });
    });
    startOutboxWorker();

    // Cloud Run sends SIGTERM before stopping an instance
    process.on("SIGTERM", () => {
      logger.info("SIGTERM received, shutting down");
      server.close(() => process.exit(0));
    });
  })
  .catch((err) => {
    logger.error("server is not connected", { err });
    process.exit(1);
  });
