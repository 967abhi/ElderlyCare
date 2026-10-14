const mongoose = require("mongoose");

// Booking events that could not be published to Pub/Sub. They are retried
// by src/events/outbox.js and deleted once published.
const outboxEventSchema = new mongoose.Schema(
  {
    eventId: { type: String, required: true, unique: true },
    eventType: { type: String, required: true },
    payload: { type: Object, required: true },
    attempts: { type: Number, default: 0 },
    lastError: { type: String },
  },
  { timestamps: true }
);

const OutboxEvent = mongoose.model("OutboxEvent", outboxEventSchema);
module.exports = OutboxEvent;
