const mongoose = require("mongoose");

const caretakerSchema = new Schema(
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
  },
  { Timestamp: true }
);

const Caretaker = mongoose.model("Caretaker", caretakerSchema);
module.exports = caretaker;
