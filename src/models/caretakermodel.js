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
    // required: true,
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
    // required: true,
  },
  pincode: {
    type: Number,
    // required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "rejected", "completed"],

    default: "completed",
  },
  // description: {
  //   type: String,
  //   maxlength: 200,
  //   required: true,
  // },
  createdAt: {
    type: Date,
    default: Date.now(),
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

const Caretaker = mongoose.model("Caretaker", caretakerSchema);
module.exports = Caretaker;
