// Notification logic shared by both Cloud Functions. Kept free of GCP / DB /
// email imports so it can be unit tested with fake dependencies.
const templates = require("./templates");

// Errors that will never succeed on retry (bad address, missing data).
// The handler logs these and returns, so Pub/Sub stops redelivering.
class PermanentError extends Error {}

const HANDLERS = {
  notifyCaretaker: {
    eventTypes: ["booking.created", "booking.cancelled"],
    recipients: async (event, deps) => {
      const caretaker = await deps.getCaretaker(event.data.caretakerId);
      if (!caretaker) throw new PermanentError(`caretaker ${event.data.caretakerId} not found`);
      if (!caretaker.email) throw new PermanentError("caretaker has no email");
      const user = await deps.getUser(event.data.userId);
      return [{ email: caretaker.email, name: caretaker.firstname, kind: "caretaker", user, caretaker }];
    },
  },
  notifyFamily: {
    eventTypes: ["booking.accepted", "booking.rejected", "booking.completed", "booking.cancelled"],
    recipients: async (event, deps) => {
      const user = await deps.getUser(event.data.userId);
      if (!user) throw new PermanentError(`user ${event.data.userId} not found`);
      const caretaker = await deps.getCaretaker(event.data.caretakerId);

      const list = [];
      if (user.email) list.push({ email: user.email, name: user.firstname, kind: "user", user, caretaker });
      for (const contact of user.familyContacts || []) {
        if (contact.notify !== false && contact.email) {
          list.push({ email: contact.email, name: contact.name, kind: "family", user, caretaker });
        }
      }
      return list;
    },
  },
};

// Pub/Sub CloudEvent -> our event envelope
const parseCloudEvent = (cloudEvent) => {
  const message = cloudEvent && cloudEvent.data && cloudEvent.data.message;
  if (!message || !message.data) throw new PermanentError("no Pub/Sub message in CloudEvent");
  let event;
  try {
    event = JSON.parse(Buffer.from(message.data, "base64").toString("utf8"));
  } catch {
    throw new PermanentError("message data is not valid JSON");
  }
  if (!event.eventId || !event.eventType || !event.data) {
    throw new PermanentError("message is not a booking event");
  }
  return { event, messageId: message.messageId || message.message_id };
};

/**
 * deps: {
 *   getUser(id), getCaretaker(id),
 *   isProcessed(key), markProcessed(key),
 *   sendEmail({ to, subject, text, html }),
 *   log(severity, message, fields)
 * }
 * Throwing a normal Error makes Pub/Sub retry the message.
 */
const handleCloudEvent = async (handlerName, cloudEvent, deps) => {
  const handler = HANDLERS[handlerName];
  let event;
  let messageId;

  try {
    ({ event, messageId } = parseCloudEvent(cloudEvent));
  } catch (err) {
    deps.log("WARNING", "dropping invalid message", { function: handlerName, reason: err.message });
    return { status: "invalid" };
  }

  const fields = {
    function: handlerName,
    eventId: event.eventId,
    eventType: event.eventType,
    bookingId: event.data.bookingId,
    messageId,
  };

  if (!handler.eventTypes.includes(event.eventType)) {
    deps.log("DEBUG", "event type not handled by this function", fields);
    return { status: "ignored" };
  }

  let recipients;
  try {
    recipients = await handler.recipients(event, deps);
  } catch (err) {
    if (err instanceof PermanentError) {
      deps.log("WARNING", "notification skipped", { ...fields, reason: err.message });
      return { status: "skipped" };
    }
    throw err;
  }

  let sent = 0;
  let duplicates = 0;
  for (const recipient of recipients) {
    // one key per recipient, so if 1 of 3 emails fails only that one is retried
    const key = `${event.eventId}:${handlerName}:${recipient.email}`;
    if (await deps.isProcessed(key)) {
      duplicates += 1;
      continue;
    }

    const message = templates.render(event, recipient);
    try {
      await deps.sendEmail({ to: recipient.email, ...message });
    } catch (err) {
      if (err instanceof PermanentError || isPermanentEmailError(err)) {
        deps.log("WARNING", "email rejected permanently, not retrying", {
          ...fields, to: recipient.email, reason: err.message,
        });
        await deps.markProcessed(key);
        continue;
      }
      deps.log("ERROR", "notification failed, Pub/Sub will retry", { ...fields, to: recipient.email, err: err.message });
      throw err;
    }
    await deps.markProcessed(key);
    sent += 1;
  }

  deps.log("INFO", "notifications sent", { ...fields, sent, duplicates, recipients: recipients.length });
  return { status: "done", sent, duplicates };
};

// SMTP 5xx (e.g. 550 mailbox does not exist) and bad envelopes won't work on retry
const isPermanentEmailError = (err) =>
  err.code === "EENVELOPE" || (err.responseCode >= 500 && err.responseCode < 600);

module.exports = { handleCloudEvent, parseCloudEvent, PermanentError, HANDLERS };
