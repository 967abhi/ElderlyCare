const bcrypt = require("bcrypt");
const User = require("../models/usermodel");
const Caretaker = require("../models/caretakermodel");
const { signToken, cookieOptions, COOKIE_NAME } = require("../../middleware/auth");
const { conflict, unauthorized } = require("../utils/AppError");

const SALT_ROUNDS = 10;

const toSafeObject = (doc) => {
  const obj = doc.toObject();
  delete obj.password;
  return obj;
};

const register = (Model, role) => async (req, res) => {
  const data = req.valid.body;
  const exists = await Model.findOne({
    $or: [{ email: data.email }, { phonenumber: data.phonenumber }],
  });
  if (exists) throw conflict("This email or phone number is already registered");

  const doc = await Model.create({
    ...data,
    password: await bcrypt.hash(data.password, SALT_ROUNDS),
  });
  req.log.info("account registered", { role, accountId: doc._id.toString() });

  const token = signToken(doc._id, role);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.status(201).json({ token, role, account: toSafeObject(doc) });
};

const login = (Model, role) => async (req, res) => {
  const { email, password } = req.valid.body;
  const doc = await Model.findOne({ email }).select("+password");
  // same message for unknown email and wrong password so emails can't be guessed
  if (!doc || !doc.password || !(await bcrypt.compare(password, doc.password))) {
    throw unauthorized("Email or password is incorrect");
  }

  const token = signToken(doc._id, role);
  res.cookie(COOKIE_NAME, token, cookieOptions());
  res.json({ token, role, account: toSafeObject(doc) });
};

const logout = (req, res) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie(COOKIE_NAME, options);
  res.json({ message: "Logged out" });
};

module.exports = {
  registerUser: register(User, "user"),
  loginUser: login(User, "user"),
  registerCaretaker: register(Caretaker, "caretaker"),
  loginCaretaker: login(Caretaker, "caretaker"),
  logout,
};
