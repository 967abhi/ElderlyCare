// REST API mounted at /api/v1
const express = require("express");
const rateLimit = require("express-rate-limit");
const { auth } = require("../../../middleware/auth");
const validate = require("../../../middleware/validate");
const { asyncHandler: h } = require("../../utils/AppError");
const v = require("../../validators");
const authController = require("../../controllers/authController");
const userController = require("../../controllers/userController");
const caretakerController = require("../../controllers/caretakerController");
const bookingController = require("../../controllers/bookingController");

const router = express.Router();

// ---- Auth ----
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT || 50),
  standardHeaders: "draft-7",
  legacyHeaders: false,
  skip: () => process.env.NODE_ENV === "test",
  message: { error: { code: "TOO_MANY_REQUESTS", message: "Too many attempts, try again later" } },
});

router.post("/auth/users/register", authLimiter, validate(v.registerUser), h(authController.registerUser));
router.post("/auth/users/login", authLimiter, validate(v.login), h(authController.loginUser));
router.post("/auth/caretakers/register", authLimiter, validate(v.registerCaretaker), h(authController.registerCaretaker));
router.post("/auth/caretakers/login", authLimiter, validate(v.login), h(authController.loginCaretaker));
router.post("/auth/logout", authController.logout);

// ---- Users (elderly) ----
router.get("/users/me", auth("user"), h(userController.getMe));
router.patch("/users/me", auth("user"), validate(v.updateUser), h(userController.updateMe));
router.get("/users/me/family-contacts", auth("user"), h(userController.listFamilyContacts));
router.post("/users/me/family-contacts", auth("user"), validate(v.familyContact), h(userController.addFamilyContact));
router.patch("/users/me/family-contacts/:contactId", auth("user"), validate(v.updateFamilyContact), h(userController.updateFamilyContact));
router.delete("/users/me/family-contacts/:contactId", auth("user"), h(userController.removeFamilyContact));

// ---- Caretakers ----
// /caretakers/me must come before /caretakers/:id
router.get("/caretakers/me", auth("caretaker"), h(caretakerController.getMe));
router.patch("/caretakers/me", auth("caretaker"), validate(v.updateCaretaker), h(caretakerController.updateMe));
router.get("/caretakers", auth(), validate(v.searchCaretakers, "query"), h(caretakerController.searchCaretakers));
router.get("/caretakers/:id", auth(), h(caretakerController.getCaretaker));

// ---- Bookings ----
router.post("/bookings", auth("user"), validate(v.createBooking), h(bookingController.createBooking));
router.get("/bookings", auth("user", "caretaker"), validate(v.listBookings, "query"), h(bookingController.listBookings));
router.get("/bookings/:id", auth("user", "caretaker"), h(bookingController.getBooking));
router.patch("/bookings/:id/accept", auth("caretaker"), validate(v.statusChange), h(bookingController.acceptBooking));
router.patch("/bookings/:id/reject", auth("caretaker"), validate(v.statusChange), h(bookingController.rejectBooking));
router.patch("/bookings/:id/cancel", auth("user"), validate(v.statusChange), h(bookingController.cancelBooking));
router.patch("/bookings/:id/complete", auth("caretaker"), validate(v.statusChange), h(bookingController.completeBooking));
router.post("/bookings/:id/review", auth("user"), validate(v.createReview), h(bookingController.reviewBooking));

module.exports = router;
