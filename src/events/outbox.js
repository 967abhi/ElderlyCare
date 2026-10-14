const logger = require("../../config/logger");
const OutboxEvent = require("../models/outboxeventmodel");
const { sendToPubSub, getTopic } = require("./publishBookingEvent");

const BATCH_SIZE = 50;

// Re-publishes events that failed earlier. The event keeps its original
// eventId, so if the first attempt actually reached Pub/Sub the notification
// functions will see a duplicate id and skip it.
const flushOutbox = async () => {
  if (!getTopic()) return { published: 0, failed: 0 };

  const pending = await OutboxEvent.find().sort({ createdAt: 1 }).limit(BATCH_SIZE);
  let published = 0;
  let failed = 0;

  for (const item of pending) {
    try {
      const messageId = await sendToPubSub(item.payload);
      await item.deleteOne();
      published += 1;
      logger.info("outbox event published", { eventId: item.eventId, eventType: item.eventType, messageId });
    } catch (err) {
      failed += 1;
      item.attempts += 1;
      item.lastError = err.message;
      await item.save();
      logger.warning("outbox event publish failed again", { eventId: item.eventId, attempts: item.attempts, err });
    }
  }
  return { published, failed };
};

// Runs flushOutbox every intervalMs. On Cloud Run this only runs while an
// instance is alive; GCP_DEPLOYMENT_GUIDE.md shows the Cloud Scheduler option.
const startOutboxWorker = (intervalMs = Number(process.env.OUTBOX_INTERVAL_MS || 60000)) => {
  const run = () =>
    flushOutbox().catch((err) => logger.error("outbox flush failed", { err }));
  run();
  const timer = setInterval(run, intervalMs);
  timer.unref();
  return timer;
};

module.exports = { flushOutbox, startOutboxWorker };
