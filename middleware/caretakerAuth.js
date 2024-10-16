const jwt = require("jsonwebtoken");
const JWT_SECRET = "abhishek";
const caretakerAuth = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send({ message: "No token, authorization denied" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ message: "Error from the caretaker auth ", err });
  }
};
module.exports = caretakerAuth;
