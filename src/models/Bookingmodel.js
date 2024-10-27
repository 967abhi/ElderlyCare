const mongoose = require("mongoose");
const BookingSchema = new mongoose.Schema(
  {
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      //   required: true,
      ref: "User",
    },
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    currentPincode: {
      type: String,
      required: true,
    },
    currentAddress: {
      type: String,
      required: true,
    },
    startingTime: {
      type: Date,
      required: true,
    },
    endTime: {
      type: Date,
      required: true,
    },
    Duration: {
      type: String,
      required: true,
    },
    Price: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);
const Booking = mongoose.model("Booking", BookingSchema);
module.exports = Booking;
