const express = require("express");
const Caretaker = require("../models/caretakermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const caretakerAuth = require("../../middleware/caretakerAuth");
const userAuth = require("../../middleware/userAuth");
const caretakerRouter = express();
// const cookie
const JWT_SECRET = "abhishek";
caretakerRouter.get("/caretaker", (req, res) => {
  res.send("hi from the care taker");
});
caretakerRouter.post("/signupcaretaker", async (req, res) => {
  try {
    const {
      firstname,
      lastname,
      age,
      email,
      address,
      phonenumber,
      password,
      pincode,
      status,
    } = req.body;
    // const userpassword=req.body.password

    //hashed the password
    const hashpassword = await bcrypt.hash(password, 10);
    const caretakerdata = new Caretaker({
      firstname,
      lastname,
      age,
      email,
      address,
      phonenumber,
      password: hashpassword,
      pincode,
      status,
    });
    const data = await caretakerdata.save();
    res.status(200).send({ message: "Signup Successfully", data });
  } catch (err) {
    res.status(400).send(err);
  }
});
caretakerRouter.post("/logincaretaker", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Caretaker.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const ispasswordvalid = await bcrypt.compare(password, user.password);
    if (!ispasswordvalid) {
      return res.status(400).send({ message: "password is not correct" });
    }
    const token = jwt.sign({ userID: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);
    res.status(200).send({ message: "Login successfully", token });
  } catch (err) {
    res.status(400).send({ message: "Error from login", err });
  }
});
caretakerRouter.get("/logoutcaretaker", async (req, res) => {
  res.cookie("token", "");

  res.status(200).send({ message: "Logged out successfully" });
});
caretakerRouter.get("/allcaretakeruser", caretakerAuth, async (req, res) => {
  try {
    const user = await Caretaker.find();
    res.status(200).send({ message: "fetched the data", user });
  } catch (err) {
    res.status(400).send({ message: "finding the error", err });
  }
});
caretakerRouter.delete(
  "/deletecaretaker/:id",
  caretakerAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const deleteuser = await Caretaker.findByIdAndDelete(id);

      if (!deleteuser) {
        return res.status(404).send({ message: "Caretaker not found" });
      }
      res
        .status(200)
        .send({ message: "User Deleted Successfully", deleteuser });
    } catch (err) {
      res
        .status(400)
        .send({ message: "error found from the delete of caretaker", err });
    }
  }
);
caretakerRouter.patch(
  "/caretakerupdate/:id",
  caretakerAuth,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { password, age, phonenumber } = req.body;
      let updatefields = {};
      if (password) {
        const hashpassword = await bcrypt.hash(password, 10);
        updatefields.password = hashpassword;
      }
      if (age) updatefields.age = age;
      if (phonenumber) updatefields.phonenumber = phonenumber;
      const updatecaretaker = await Caretaker.findByIdAndUpdate(
        id,
        updatefields,
        { new: true }
      );
      if (!updatecaretaker) {
        res.status(400).send({ message: "caretake not found" });
      }
      res
        .status(200)
        .send({ message: "updated successfully", updatecaretaker });
    } catch (err) {
      res
        .status(200)
        .send({ message: "error from the update of the care taker ", err });
    }
  }
);
//update the status
caretakerRouter.put("/update-status/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["accepted", "rejected", "completed"].includes(status)) {
      return res.status(400).send({ message: "Invalid status" });
    }
    const updatestatus = await Caretaker.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    if (!updatestatus) {
      return res.status(400).send({ message: "caretaker not found" });
    }
    res
      .status(200)
      .send({ message: "status updated successfully", updatestatus });
  } catch (err) {
    res.status(400).send({ message: "err found on the status update" });
  }
});
module.exports = caretakerRouter;
