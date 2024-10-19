const jwt = require("jsonwebtoken");
const JWT_SECRET = "ABHISHEK"; // Keep this secret secure

const userAuth = (req, res, next) => {
  // const token = req.cookies.token; // Access the token from cookies
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "No token, authorization denied" });
  }

  // if (!token) {
  //   return res.status(401).send({ message: "No token, authorization denied" });
  // }

  // try {
  //   const decoded = jwt.verify(token, JWT_SECRET);
  //   req.user = decoded; // Attach user info to request
  //   next(); // Call next middleware
  // } catch (err) {
  //   return res.status(401).send({ message: "Token is not valid" });
  // }
  const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token", err });
  }
};

module.exports = userAuth;
