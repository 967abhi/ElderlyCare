// Sends a fake Pub/Sub CloudEvent to a function running locally with the
// Functions Framework (npm run start:caretaker / start:family).
//
// usage: node scripts/sendTestEvent.js <eventType> <bookingId> <userId> <caretakerId> [port]
// e.g.   node scripts/sendTestEvent.js booking.created 6710... 6710... 6710... 8081
const { randomUUID } = require("crypto");

const [eventType = "booking.created", bookingId, userId, caretakerId, port = "8081"] =
  process.argv.slice(2);

if (!bookingId || !userId || !caretakerId) {
  console.error("usage: node scripts/sendTestEvent.js <eventType> <bookingId> <userId> <caretakerId> [port]");
  process.exit(1);
}

const start = new Date(Date.now() + 24 * 60 * 60 * 1000);
const event = {
  eventId: randomUUID(),
  eventType,
  occurredAt: new Date().toISOString(),
  version: 1,
  data: {
    bookingId,
    userId,
    caretakerId,
    startTime: start.toISOString(),
    endTime: new Date(start.getTime() + 3 * 60 * 60 * 1000).toISOString(),
    hours: 3,
    hourlyRate: 300,
    totalPrice: 900,
    serviceAddress: "12 MG Road",
    status: eventType.split(".")[1],
  },
};

const body = {
  message: {
    data: Buffer.from(JSON.stringify(event)).toString("base64"),
    attributes: { eventType, bookingId },
    messageId: String(Date.now()),
  },
  subscription: "projects/local/subscriptions/local",
};

fetch(`http://localhost:${port}/`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "ce-id": body.message.messageId,
    "ce-specversion": "1.0",
    "ce-type": "google.cloud.pubsub.topic.v1.messagePublished",
    "ce-source": "//pubsub.googleapis.com/projects/local/topics/booking-events",
  },
  body: JSON.stringify(body),
})
  .then(async (res) => console.log(res.status, await res.text()))
  .catch((err) => {
    console.error("request failed:", err.message);
    process.exit(1);
  });
