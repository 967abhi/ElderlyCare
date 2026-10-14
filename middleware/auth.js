const jwt = require("jsonwebtoken");
const { unauthorized, forbidden } = require("../src/utils/AppError");

const COOKIE_NAME = "access_token";

const signToken = (id, role) =>
  jwt.sign({ sub: id.toString(), role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const cookieOptions = () => {
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    // the frontend is on a different domain in production, so cross-site cookies are needed
    sameSite: isProd ? "none" : "lax",
    maxAge: 24 * 60 * 60 * 1000,
  };
};

// auth() allows any logged-in account; auth("user") / auth("caretaker") also checks the role.
// The token is read from "Authorization: Bearer <token>" or from the access_token cookie.
const auth = (...roles) => (req, res, next) => {
  const header = req.header("Authorization");
  const token = header && header.startsWith("Bearer ")
    ? header.slice(7)
    : req.cookies && req.cookies[COOKIE_NAME];

  if (!token) return next(unauthorized());

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return next(unauthorized("Invalid or expired token"));
  }

  if (roles.length && !roles.includes(payload.role)) return next(forbidden());

  req.auth = { id: payload.sub, role: payload.role };
  next();
};

module.exports = { auth, signToken, cookieOptions, COOKIE_NAME };
