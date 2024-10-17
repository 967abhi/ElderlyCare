const express = require("express");
const User = require("../models/usermodel");
const bcrypt = require("bcrypt");
const userRoutes = express();
const jwt = require("jsonwebtoken");
const userAuth = require("../../middleware/userAuth");
const Caretaker = require("../models/caretakermodel");
const { getAllCaretakers } = require("../controllers/userController");
const Review = require("../models/reviewmodel");

const JWT_SECRET = "ABHISHEK";

// Register User
userRoutes.post("/user", async (req, res) => {
  try {
    const { firstname, lastname, age, phonenumber, email, gender, password } =
      req.body;
    // Hash the password
    const passwordhashed = await bcrypt.hash(password, 10);
    const data = new User({
      firstname,
      lastname,
      age,
      phonenumber,
      email,
      gender,
      password: passwordhashed,
    });
    await data.save();
    res.status(200).send({ message: "Data saved successfully" });
  } catch (err) {
    console.log("Error found", err);
    res.status(500).send({ message: "Internal server error", err });
  }
});

// User Login
userRoutes.post("/userlogin", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Password is not valid" });
    }
    // Generate token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });
    // Set token in cookies
    res.cookie("token", token);
    res.status(200).send({ message: "Login successfully", token });
  } catch (err) {
    res.status(400).send({ message: "Error occurred", err });
  }
});

// Get All Users
userRoutes.get("/alluser", userAuth, async (req, res) => {
  try {
    const data = await User.find(); // Await the data
    res.status(200).send({ message: "User data retrieved", users: data });
  } catch (err) {
    res.status(400).send({ message: "Error encountered", err });
  }
});
//search by email
userRoutes.post("/searchuser", userAuth, async (req, res) => {
  try {
    const { email } = req.body;
    const data = await User.find({ email }); // Await the data
    res.status(200).send({ message: "User data retrieved", users: data });
  } catch (err) {
    res.status(400).send({ message: "Error encountered", err });
  }
});
//search by the pincode in the caretaker and then show
userRoutes.post("/enterthepincode", async (req, res) => {
  try {
    const { pincode } = req.body;
    const data = await Caretaker.find({
      pincode,
      status: { $in: ["rejected", "completed"] },
    });
    if (!data) {
      return res.status(400).send({
        message:
          "No Care taker are available for this pincode write the another pincode",
      });
    }
    res.status(200).send({ message: "Successfully fetch the caretaker", data });
  } catch (err) {
    res.status(400).send({ message: "Error found", err });
  }
});
userRoutes.post("/add-review/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { caretakerId, rating, reviewText } = req.body;
    if (rating < 0 || rating > 5) {
      return res
        .status(400)
        .send({ message: "Rating must be between 0 and 5" });
    }
    const newReview = new Review({
      caretakerId,
      userId: id,
      rating,
      reviewText,
    });
    const data = await newReview.save();
    res.status(200).send({ message: "Review Update Successfully", data });
  } catch (err) {
    res
      .status(400)
      .send({ message: "Error found in the add review section", err });
  }
});

userRoutes.get("/getallthecaretaker", getAllCaretakers);
module.exports = userRoutes;
