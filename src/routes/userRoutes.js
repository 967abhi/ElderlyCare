const express = require("express");
const User = require("../models/usermodel");
const bcrypt = require("bcrypt");
const userRoutes = express();
const jwt = require("jsonwebtoken");
const userAuth = require("../../middleware/userAuth");

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

module.exports = userRoutes;
