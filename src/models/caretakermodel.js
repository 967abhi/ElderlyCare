const mongoose = require("mongoose");

const caretakerSchema = new mongoose.Schema({
  firstname: {
    type: String,
    // required: true,
  },
  lastname: {
    type: String,
    // required: true,
  },
  age: {
    type: String,
    // required: true,
  },
  email: {
    type: String,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true,
  },
  address: {
    type: String,
    // required: true,
  },
  phonenumber: {
    type: Number,
    // required: true,
  },
  password: {
    type: String,
    select: false,
  },
  pincode: {
    type: Number,
    // required: true,
  },
  description: {
    type: String,
    maxlength: 200,
    // required: true,
  },
  // price per hour; bookings copy this value when they are created
  hourlyRate: {
    type: Number,
    min: 0,
  },
  skills: {
    type: [String],
    default: [],
  },
  experienceYears: {
    type: Number,
    min: 0,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  avgRating: {
    type: Number,
    default: 0,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

  // ---- Legacy fields: still used by the old routes in caretakerRoutes.js.
  // Bookings now live in the Booking collection; remove these once the
  // frontend uses /api/v1/bookings.
  status: {
    type: String,
    enum: ["accepted", "rejected", "completed"],

    default: "completed",
  },
  caretakerrequeststatus: {
    type: [String],
    enum: ["accepted", "rejected", "pending"],

    default: "pending",
  },
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    // required: true,
  },
  userfirstname: {
    type: [String],
    // required: true,
  },
  userlastname: {
    type: [String],
    // required: true,
  },
  useremail: {
    type: [String],
    // required: true,
  },
  userphonenumber: {
    type: [Number],
    // required: true,
  },
  userpincode: {
    type: [Number],
    // required: true,
  },
  usercurrentaddress: {
    type: [String],
    // required: true,
  },
  userstartingtime: {
    type: [Date],
    // required: true,
  },
  userendingtime: {
    type: [Date],
    // required: true,
  },
  userduration: {
    type: [String],
    // required: true,
  },
  userprice: {
    type: [String],
    // required: true,
  },
});

// fields returned by the /api/v1 endpoints (hides password and legacy booking arrays)
caretakerSchema.statics.PUBLIC_FIELDS =
  "firstname lastname age email address phonenumber pincode description hourlyRate skills experienceYears isAvailable isVerified avgRating reviewCount createdAt";

const Caretaker = mongoose.model("Caretaker", caretakerSchema);
module.exports = Caretaker;
