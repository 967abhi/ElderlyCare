const mongoose = require("mongoose");

const connectDB = (uri = process.env.MONGO_URI) => {
  if (!uri) {
    throw new Error("MONGO_URI is not set");
  }
  return mongoose.connect(uri);
};

module.exports = connectDB;
