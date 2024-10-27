const express = require("express");
const Booking = require("../models/Bookingmodel");
const bookingRouter = express();

bookingRouter.post("/bookingRoutes", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      email,
      phoneNumber,
      currentPincode,
      currentAddress,
      startingTime,
      endTime,
      Duration,
      Price,
    } = req.body;
    const bookinguser = new Booking({
      firstname,
      lastname,
      email,
      phoneNumber,
      currentPincode,
      currentAddress,
      startingTime,
      endTime,
      Duration,
      Price,
    });
    const booking = await bookinguser.save();
    res.status(200).send({ message: "Booking data saved", booking });
  } catch (err) {
    res.status(400).send({ message: "Error found ", err });
  }
});
bookingRouter.get("/bookingRoutes", async (req, res) => {
  try {
    // const data = await bookinguser.find();
    const data = await Booking.find();

    res.send(data);
  } catch (err) {
    res.status(200).send({ message: "Sending data", err });
  }
});

module.exports = bookingRouter;
