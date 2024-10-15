const mongoose = require("mongoose");
require("dotenv").config();
const database = mongoose.connect(
  //   "mongodb+srv://Elderly:Elderlycare123@cluster0.qfmya.mongodb.net/"
  process.env.db_name
);

module.exports = database;
