const jwt = require("jsonwebtoken");
const JWT_SECRET = "ABHISHEK"; // Keep this secret secure

const userAuth = (req, res, next) => {
  const token = req.cookies.token; // Access the token from cookies

  if (!token) {
    return res.status(401).send({ message: "No token, authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Attach user info to request
    next(); // Call next middleware
  } catch (err) {
    return res.status(401).send({ message: "Token is not valid" });
  }
};

module.exports = userAuth;
