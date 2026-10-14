const { randomUUID } = require("crypto");
const { PubSub } = require("@google-cloud/pubsub");
const logger = require("../../config/logger");
const OutboxEvent = require("../models/outboxeventmodel");

const PUBLISH_TIMEOUT_MS = Number(process.env.PUBSUB_PUBLISH_TIMEOUT_MS || 5000);

let topic;
const getTopic = () => {
  const topicName = process.env.PUBSUB_BOOKING_TOPIC;
  if (!topicName) return null;
  if (!topic) {
    // Uses Application Default Credentials: the service account on Cloud Run,
    // or PUBSUB_EMULATOR_HOST / GOOGLE_APPLICATION_CREDENTIALS locally.
    const pubsub = new PubSub(process.env.GCP_PROJECT_ID ? { projectId: process.env.GCP_PROJECT_ID } : {});
    topic = pubsub.topic(topicName);
  }
  return topic;
};

const buildEvent = (eventType, booking, extra = {}) => ({
  eventId: randomUUID(),
  eventType,
  occurredAt: new Date().toISOString(),
  version: 1,
  data: {
    bookingId: booking._id.toString(),
    userId: booking.userId.toString(),
    caretakerId: booking.caretakerId.toString(),
    startTime: booking.startTime.toISOString(),
    endTime: booking.endTime.toISOString(),
    hours: booking.hours,
    hourlyRate: booking.hourlyRate,
    totalPrice: booking.totalPrice,
    serviceAddress: booking.serviceAddress,
    status: booking.status,
    ...extra,
  },
});

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error(`publish timed out after ${ms}ms`)), ms)),
  ]);

// Sends one event to Pub/Sub. Throws if it fails.
const sendToPubSub = async (event) => {
  const t = getTopic();
  return withTimeout(
    t.publishMessage({
      json: event,
      attributes: { eventType: event.eventType, bookingId: event.data.bookingId },
    }),
    PUBLISH_TIMEOUT_MS
  );
};

// Called by the booking controller after the booking is saved.
// Never throws: if Pub/Sub is down the event is stored in the outbox and
// retried later, so the HTTP request still succeeds.
const publishBookingEvent = async (eventType, booking, extra, log = logger) => {
  const event = buildEvent(eventType, booking, extra);
  const fields = { eventId: event.eventId, eventType, bookingId: event.data.bookingId };

  if (!getTopic()) {
    log.info("pubsub disabled (PUBSUB_BOOKING_TOPIC not set), event not published", fields);
    return { event, published: false };
  }

  try {
    const messageId = await sendToPubSub(event);
    log.info("booking event published", { ...fields, messageId });
    return { event, published: true, messageId };
  } catch (err) {
    log.error("booking event publish failed, saved to outbox", { ...fields, err });
    try {
      await OutboxEvent.create({
        eventId: event.eventId,
        eventType,
        payload: event,
        attempts: 1,
        lastError: err.message,
      });
    } catch (outboxErr) {
      log.error("could not save event to outbox", { ...fields, err: outboxErr });
    }
    return { event, published: false };
  }
};

// for tests
const _setTopic = (t) => {
  topic = t;
};

module.exports = { publishBookingEvent, sendToPubSub, buildEvent, getTopic, _setTopic };
