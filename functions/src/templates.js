// Email text for each event type and recipient kind ("caretaker", "user", "family").

const fmt = (iso) =>
  new Date(iso).toLocaleString("en-IN", {
    timeZone: process.env.TIMEZONE || "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

const fullName = (person) => (person ? `${person.firstname || ""} ${person.lastname || ""}`.trim() : "");

const SUBJECTS = {
  "booking.created": "New booking request",
  "booking.accepted": "Booking confirmed",
  "booking.rejected": "Booking declined",
  "booking.cancelled": "Booking cancelled",
  "booking.completed": "Visit completed",
};

const body = (event, recipient) => {
  const { data } = event;
  const when = `${fmt(data.startTime)} to ${fmt(data.endTime)} (${data.hours} h)`;
  const elder = fullName(recipient.user) || "the client";
  const carer = fullName(recipient.caretaker) || "the caretaker";
  // family contacts read "Asha Rao's booking", the user reads "your booking"
  const whose = recipient.kind === "family" ? `${elder}'s` : "your";
  const Whose = whose.charAt(0).toUpperCase() + whose.slice(1);
  const reason = data.reason ? `\nReason: ${data.reason}` : "";

  switch (event.eventType) {
    case "booking.created":
      return `${elder} has requested a visit.\nWhen: ${when}\nAddress: ${data.serviceAddress}\nPay: ₹${data.totalPrice}\n\nPlease accept or reject it in the app.`;
    case "booking.accepted":
      return `${carer} accepted ${whose} booking.\nWhen: ${when}\nAddress: ${data.serviceAddress}\nTotal: ₹${data.totalPrice}`;
    case "booking.rejected":
      return `${carer} could not take ${whose} booking for ${when}.${reason}\n\nPlease choose another caretaker in the app.`;
    case "booking.cancelled":
      return recipient.kind === "caretaker"
        ? `${elder} cancelled the booking for ${when}.${reason}`
        : `${Whose} booking with ${carer} for ${when} was cancelled.${reason}`;
    case "booking.completed":
      return `${carer} has completed the visit (${when}).\nTotal: ₹${data.totalPrice}\n\nYou can leave a review in the app.`;
    default:
      return `Booking ${data.bookingId} is now ${data.status}.`;
  }
};

const escapeHtml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

const render = (event, recipient) => {
  const text = `Hi ${recipient.name || "there"},\n\n${body(event, recipient)}\n\nElderlyCare`;
  return {
    subject: `ElderlyCare: ${SUBJECTS[event.eventType] || "Booking update"}`,
    text,
    html: `<div style="font-family:sans-serif;font-size:16px;line-height:1.5">${escapeHtml(text).replace(/\n/g, "<br>")}</div>`,
  };
};

module.exports = { render };
