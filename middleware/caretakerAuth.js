// // const jwt = require("jsonwebtoken");
// // const JWT_SECRET = "abhishek";
// // const caretakerAuth = (req, res, next) => {
// //   const token = req.cookies.token;
// //   if (!token) {
// //     return res.status(401).send({ message: "No token, authorization denied" });
// //   }
// //   try {
// //     const decoded = jwt.verify(token, JWT_SECRET);
// //     req.user = decoded;
// //     next();
// //   } catch (err) {
// //     res.status(400).send({ message: "Error from the caretaker auth ", err });
// //   }
// // };
// // module.exports = caretakerAuth;
// const jwt = require("jsonwebtoken");
// const JWT_SECRET = "abhishek";

// const caretakerAuth = (req, res, next) => {
//   // Extract token from the 'Authorization' header
//   const authHeader = req.header("Authorization");

//   if (!authHeader || !authHeader.startsWith("Bearer ")) {
//     return res.status(401).send({ message: "No token, authorization denied" });
//   }

//   const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     res.status(400).send({ message: "Invalid token", err });
//   }
// };

// module.exports = caretakerAuth;

// middleware/caretakerAuth.js
const jwt = require("jsonwebtoken");
const JWT_SECRET = "abhishek";

const caretakerAuth = (req, res, next) => {
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after 'Bearer'

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // Contains userId now
    next();
  } catch (err) {
    res.status(400).send({ message: "Invalid token", err });
  }
};

module.exports = caretakerAuth;
