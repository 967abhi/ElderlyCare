const Caretaker = require("../models/caretakermodel");

const getAllCaretakers = async (req, res) => {
  try {
    const data = await Caretaker.find();
    if (!data || data.length === 0) {
      return res.status(400).send({ message: "No caretakers are available" });
    }
    res.status(200).send({ message: "Fetched successfully", data });
  } catch (err) {
    res.status(400).send({ message: "Found an error", err });
  }
};
module.exports = { getAllCaretakers };
