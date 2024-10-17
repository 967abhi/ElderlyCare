const mongoose = require("mongoose");

const caretakerSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    age: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["accepted", "rejected", "completed"],

      default: "completed",
    },
    description: {
      type: String,
      required: true,
    },
  },
  { timestamp: true }
);

const Caretaker = mongoose.model("Caretaker", caretakerSchema);
module.exports = Caretaker;
