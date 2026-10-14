const { badRequest } = require("./AppError");

const MIN_HOURS = 1;
const MAX_HOURS = 12;
const HOUR_MS = 60 * 60 * 1000;

// Bookings are hourly, in half-hour steps, between 1 and 12 hours.
const calculateHours = (startTime, endTime) => {
  const hours = (endTime.getTime() - startTime.getTime()) / HOUR_MS;
  if (hours <= 0) throw badRequest("endTime must be after startTime");
  if (hours < MIN_HOURS) throw badRequest(`A booking must be at least ${MIN_HOURS} hour`);
  if (hours > MAX_HOURS) throw badRequest(`A booking can be at most ${MAX_HOURS} hours`);
  if (!Number.isInteger(hours * 2)) throw badRequest("Booking length must be in 30 minute steps");
  return hours;
};

const calculatePrice = (hours, hourlyRate) => Math.round(hours * hourlyRate * 100) / 100;

// Allowed status changes: action -> who can do it, which statuses it starts from, the new status
const TRANSITIONS = {
  accept: { role: "caretaker", from: ["pending"], to: "accepted" },
  reject: { role: "caretaker", from: ["pending"], to: "rejected" },
  cancel: { role: "user", from: ["pending", "accepted"], to: "cancelled" },
  complete: { role: "caretaker", from: ["accepted"], to: "completed" },
};

module.exports = { calculateHours, calculatePrice, TRANSITIONS, MIN_HOURS, MAX_HOURS };
