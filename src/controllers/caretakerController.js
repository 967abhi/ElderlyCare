const bcrypt = require("bcrypt");
const Caretaker = require("../models/caretakermodel");
const Review = require("../models/reviewmodel");
const { notFound } = require("../utils/AppError");

const FIELDS = Caretaker.PUBLIC_FIELDS;

// GET /caretakers?pincode=&skill=&minRating=&page=&limit=
const searchCaretakers = async (req, res) => {
  const { pincode, skill, minRating, page, limit } = req.valid.query;
  const filter = { isAvailable: { $ne: false }, hourlyRate: { $gt: 0 } };
  if (pincode) filter.pincode = pincode;
  if (skill) filter.skills = { $regex: `^${skill.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" };
  if (minRating !== undefined) filter.avgRating = { $gte: minRating };

  const [caretakers, total] = await Promise.all([
    Caretaker.find(filter)
      .select(FIELDS)
      .sort({ avgRating: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Caretaker.countDocuments(filter),
  ]);

  res.json({ caretakers, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// GET /caretakers/:id
const getCaretaker = async (req, res) => {
  const caretaker = await Caretaker.findById(req.params.id).select(FIELDS);
  if (!caretaker) throw notFound("Caretaker not found");

  const reviews = await Review.find({ caretakerId: caretaker._id })
    .sort({ createdAt: -1 })
    .limit(20)
    .populate("userId", "firstname lastname");

  res.json({ caretaker, reviews });
};

// GET /caretakers/me
const getMe = async (req, res) => {
  const caretaker = await Caretaker.findById(req.auth.id).select(FIELDS);
  if (!caretaker) throw notFound("Caretaker not found");
  res.json({ caretaker });
};

// PATCH /caretakers/me
const updateMe = async (req, res) => {
  const updates = { ...req.valid.body };
  if (updates.password) updates.password = await bcrypt.hash(updates.password, 10);

  const caretaker = await Caretaker.findByIdAndUpdate(req.auth.id, updates, {
    new: true,
    runValidators: true,
  }).select(FIELDS);
  if (!caretaker) throw notFound("Caretaker not found");
  res.json({ caretaker });
};

module.exports = { searchCaretakers, getCaretaker, getMe, updateMe };
