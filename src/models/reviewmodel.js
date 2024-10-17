const mongoose = require("mongoose");
const revieSchema = new mongoose.Schema({
  caretakerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Caretaker",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  rating: {
    type: Number,
    min: 0,
    max: 5,
    required: true,
  },
  reviewText: {
    type: String,
    maxlength: 500,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});
const Review = mongoose.model("Review", revieSchema);
module.exports = Review;
