const bcrypt = require("bcrypt");
const Caretaker = require("../models/caretakermodel");
const User = require("../models/usermodel");
const { notFound } = require("../utils/AppError");

// legacy: used by GET /getallthecaretaker
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

const findMe = async (req) => {
  const user = await User.findById(req.auth.id);
  if (!user) throw notFound("User not found");
  return user;
};

const getMe = async (req, res) => {
  res.json({ user: await findMe(req) });
};

const updateMe = async (req, res) => {
  const updates = { ...req.valid.body };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

  const user = await User.findByIdAndUpdate(req.auth.id, updates, {
    new: true,
    runValidators: true,
  });
  if (!user) throw notFound("User not found");
  res.json({ user });
};

const listFamilyContacts = async (req, res) => {
  const user = await findMe(req);
  res.json({ familyContacts: user.familyContacts });
};

const addFamilyContact = async (req, res) => {
  const user = await findMe(req);
  user.familyContacts.push(req.valid.body);
  await user.save();
  res.status(201).json({ familyContact: user.familyContacts[user.familyContacts.length - 1] });
};

const updateFamilyContact = async (req, res) => {
  const user = await findMe(req);
  const contact = user.familyContacts.id(req.params.contactId);
  if (!contact) throw notFound("Family contact not found");
  contact.set(req.valid.body);
  await user.save();
  res.json({ familyContact: contact });
};

const removeFamilyContact = async (req, res) => {
  const user = await findMe(req);
  const contact = user.familyContacts.id(req.params.contactId);
  if (!contact) throw notFound("Family contact not found");
  contact.deleteOne();
  await user.save();
  res.status(204).end();
};

module.exports = {
  getAllCaretakers,
  getMe,
  updateMe,
  listFamilyContacts,
  addFamilyContact,
  updateFamilyContact,
  removeFamilyContact,
};
