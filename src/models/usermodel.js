const mongoose = require("mongoose");
const familyContactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  relation: { type: String },
  email: { type: String, lowercase: true, trim: true },
  phone: { type: String },
  notify: { type: Boolean, default: true },
});

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
      unique: true,
      lowercase: true,
      trim: true,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
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
    },
    description: {
      type: String,
    },
    // people who get booking updates (accepted / rejected / completed / cancelled)
    familyContacts: [familyContactSchema],
  },
  { timestamps: true }
);
const User = mongoose.model("User", userschema);
module.exports = User;
