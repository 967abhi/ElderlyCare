const mongoose = require("mongoose");
const userschema = new mongoose.Schema(
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
      type: Number,
      required: true,
    },
    phonenumber: {
      type: Number,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    pincode: {
      type: Number,
      required: true,
    },
    currentAddress: {
      type: String,
      default: "",
    },
    city: {
      type: String,
      default: "",
    },
    currentpincode: {
      type: Number,
      default: "",
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("User", userschema);
module.exports = User;
