const mongoose = require("mongoose");

const BOOKING_STATUSES = ["pending", "accepted", "rejected", "cancelled", "completed"];

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    caretakerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Caretaker",
      required: true,
      index: true,
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    // hours, hourlyRate and totalPrice are always calculated on the server
    hours: { type: Number, required: true },
    hourlyRate: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    serviceAddress: { type: String, required: true },
    pincode: { type: Number },
    notes: { type: String, maxlength: 500 },
    status: {
      type: String,
      enum: BOOKING_STATUSES,
      default: "pending",
      index: true,
    },
    statusHistory: [
      {
        _id: false,
        status: { type: String, enum: BOOKING_STATUSES },
        at: { type: Date, default: Date.now },
        by: { type: String }, // "user" | "caretaker"
        reason: { type: String },
      },
    ],
  },
  { timestamps: true }
);

// used by the "does this caretaker already have a booking at this time" check
bookingSchema.index({ caretakerId: 1, status: 1, startTime: 1, endTime: 1 });

const Booking = mongoose.model("Booking", bookingSchema);
module.exports = Booking;
module.exports.BOOKING_STATUSES = BOOKING_STATUSES;
