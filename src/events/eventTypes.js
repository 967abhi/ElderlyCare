// Event types published to the booking-events Pub/Sub topic.
// The notification functions in /functions react to these strings.
module.exports = {
  BOOKING_CREATED: "booking.created",
  BOOKING_ACCEPTED: "booking.accepted",
  BOOKING_REJECTED: "booking.rejected",
  BOOKING_CANCELLED: "booking.cancelled",
  BOOKING_COMPLETED: "booking.completed",
};
