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
    const checkemail = await Caretaker.findOne({
      $or: [{ email }, { phonenumber }],
    });
    if (checkemail) {
      return res.status(400).send({
        message: "The email and phonenumber is already registered",
      });
    }
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
// caretakerRouter.post("/logincaretaker", async (req, res) => {
//   try {
//     const { email, password } = req.body;
//     const user = await Caretaker.findOne({ email });
//     if (!user) {
//       return res.status(400).send({ message: "User not found" });
//     }
//     const ispasswordvalid = await bcrypt.compare(password, user.password);
//     if (!ispasswordvalid) {
//       return res.status(400).send({ message: "password is not correct" });
//     }
//     const token = jwt.sign({ userID: user._id }, JWT_SECRET, {
//       expiresIn: "1h",
//     });

//     res.cookie("token", token);
//     res.status(200).send({ message: "Login successfully", token });
//   } catch (err) {
//     res.status(400).send({ message: "Error from login", err });
//   }
// });
caretakerRouter.post("/logincaretaker", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await Caretaker.findOne({ email });
    if (!user) {
      return res.status(400).send({ message: "User not found" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).send({ message: "Password is incorrect" });
    }
    // Sign the JWT with user ID
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token);
    res.status(200).send({ message: "Login successfully", token });
  } catch (err) {
    res.status(400).send({ message: "Error during login", err });
  }
});
caretakerRouter.get("/logoutcaretaker", async (req, res) => {
  res.cookie("token", "");

  res.status(200).send({ message: "Logged out successfully" });
});
caretakerRouter.get("/allcaretakeruser", userAuth, async (req, res) => {
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
//update the statususerduration
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
// caretakerRouter.post("/bookingform/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const {
//       userfirstname,
//       userlastname,
//       useremail,
//       userphonenumber,
//       userpincode,
//       usercurrentaddress,
//       userstartingtime,
//       userendingtime,
//       userduration,
//       userprice,
//     } = req.body;
//     const data = new Caretaker({
//       userid: id,
//       userfirstname,
//       userlastname,
//       useremail,
//       userphonenumber,
//       userpincode,
//       usercurrentaddress,
//       userstartingtime,
//       userendingtime,
//       userduration,
//       userprice,
//     });
//     const result = await data.save();
//     res.status(200).send({ message: "Data Successfully", result });
//   } catch (err) {
//     res.status(400).send({ message: "error found", err });
//   }
// });

caretakerRouter.post("/update/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const {
      userfirstname,
      userlastname,
      useremail,
      userphonenumber,
      userpincode,
      usercurrentaddress,
      userstartingtime,
      userendingtime,
      userduration,
      userprice,
    } = req.body;

    const updatedData = await Caretaker.findByIdAndUpdate(
      id,
      {
        $push: {
          userfirstname,
          userlastname,
          useremail,
          userphonenumber,
          userpincode,
          usercurrentaddress,
          userstartingtime,
          userendingtime,
          userduration,
          userprice,
        },
      },
      { new: true } // This returns the updated document
    );

    if (!updatedData) {
      return res.status(404).send({ message: "User not found" });
    }

    res
      .status(200)
      .send({ message: "User data updated successfully", updatedData });
  } catch (err) {
    res.status(400).send({ message: "Error updating data", err });
  }
});
caretakerRouter.get("/find/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const data = await Caretaker.findById(id);
    res.status(200).send({ message: "user find successfully", data });
  } catch (err) {
    res.status(400).send({ message: "Error Found ", err });
  }
});
caretakerRouter.get("/me", caretakerAuth, async (req, res) => {
  try {
    const user = await Caretaker.findById(req.user.userId).select(
      "firstName lastName age email address phoneNumber pincode status createdAt usercurrentaddress userduration useremail userfirstname userlastname userphonenumber userpincode userprice userendingtime userstartingtime "
    );
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send({ user });
  } catch (error) {
    res.status(500).send({ message: "Error retrieving user data", error });
  }
});

module.exports = caretakerRouter;
