const Booking = require("../models/bookingmodel");
const Caretaker = require("../models/caretakermodel");
const Review = require("../models/reviewmodel");
const User = require("../models/usermodel");
const EVENTS = require("../events/eventTypes");
const { publishBookingEvent } = require("../events/publishBookingEvent");
const { calculateHours, calculatePrice, TRANSITIONS } = require("../utils/booking");
const { badRequest, conflict, forbidden, notFound } = require("../utils/AppError");

const ACTIVE_STATUSES = ["pending", "accepted"];

const EVENT_FOR_STATUS = {
  accepted: EVENTS.BOOKING_ACCEPTED,
  rejected: EVENTS.BOOKING_REJECTED,
  cancelled: EVENTS.BOOKING_CANCELLED,
  completed: EVENTS.BOOKING_COMPLETED,
};

const ownerField = (role) => (role === "caretaker" ? "caretakerId" : "userId");

// Loads a booking that belongs to the logged-in user/caretaker.
// Returns 404 (not 403) for other people's bookings so ids can't be probed.
const findOwnBooking = async (req) => {
  const booking = await Booking.findOne({
    _id: req.params.id,
    [ownerField(req.auth.role)]: req.auth.id,
  });
  if (!booking) throw notFound("Booking not found");
  return booking;
};

const hasOverlap = (caretakerId, startTime, endTime, excludeId) =>
  Booking.exists({
    caretakerId,
    status: { $in: ACTIVE_STATUSES },
    startTime: { $lt: endTime },
    endTime: { $gt: startTime },
    ...(excludeId && { _id: { $ne: excludeId } }),
  });

// POST /bookings
const createBooking = async (req, res) => {
  const { caretakerId, startTime, endTime, serviceAddress, pincode, notes } = req.valid.body;

  if (startTime.getTime() <= Date.now()) throw badRequest("startTime must be in the future");
  const hours = calculateHours(startTime, endTime);

  const [caretaker, user] = await Promise.all([
    Caretaker.findById(caretakerId),
    User.findById(req.auth.id),
  ]);
  if (!caretaker) throw notFound("Caretaker not found");
  if (!user) throw notFound("User not found");
  if (caretaker.isAvailable === false) throw conflict("This caretaker is not taking bookings right now");
  if (!caretaker.hourlyRate) throw conflict("This caretaker has not set an hourly rate yet");

  if (await hasOverlap(caretaker._id, startTime, endTime)) {
    throw conflict("The caretaker already has a booking during this time");
  }

  const booking = await Booking.create({
    userId: user._id,
    caretakerId: caretaker._id,
    startTime,
    endTime,
    hours,
    hourlyRate: caretaker.hourlyRate,
    totalPrice: calculatePrice(hours, caretaker.hourlyRate),
    serviceAddress: serviceAddress || user.currentAddress || user.address,
    pincode: pincode || user.currentpincode || user.pincode,
    notes,
    statusHistory: [{ status: "pending", by: "user" }],
  });

  req.log.info("booking created", { bookingId: booking._id.toString(), caretakerId, hours });
  await publishBookingEvent(EVENTS.BOOKING_CREATED, booking, {}, req.log);

  res.status(201).json({ booking });
};

// GET /bookings?status=&page=&limit=
const listBookings = async (req, res) => {
  const { status, page, limit } = req.valid.query;
  const filter = { [ownerField(req.auth.role)]: req.auth.id };
  if (status) filter.status = status;

  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .sort({ startTime: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("userId", "firstname lastname phonenumber")
      .populate("caretakerId", "firstname lastname phonenumber hourlyRate"),
    Booking.countDocuments(filter),
  ]);

  res.json({ bookings, page, limit, total, totalPages: Math.ceil(total / limit) });
};

// GET /bookings/:id
const getBooking = async (req, res) => {
  const booking = await findOwnBooking(req);
  await booking.populate([
    { path: "userId", select: "firstname lastname phonenumber email" },
    { path: "caretakerId", select: "firstname lastname phonenumber email hourlyRate" },
  ]);
  res.json({ booking });
};

// PATCH /bookings/:id/accept | reject | cancel | complete
const changeStatus = (action) => async (req, res) => {
  const { role, from, to } = TRANSITIONS[action];
  if (req.auth.role !== role) throw forbidden(`Only the ${role} can ${action} a booking`);

  const booking = await findOwnBooking(req);
  if (!from.includes(booking.status)) {
    throw conflict(`Cannot ${action} a booking that is ${booking.status}`);
  }
  if (action === "cancel" && booking.startTime.getTime() <= Date.now()) {
    throw conflict("A booking cannot be cancelled after it has started");
  }
  if (action === "complete" && booking.startTime.getTime() > Date.now()) {
    throw conflict("A booking cannot be completed before it starts");
  }

  const reason = req.valid.body.reason;
  // only update if the status is still what we checked, so two requests at
  // the same time can't both change it
  const updated = await Booking.findOneAndUpdate(
    { _id: booking._id, status: booking.status },
    {
      $set: { status: to },
      $push: { statusHistory: { status: to, by: role, reason, at: new Date() } },
    },
    { new: true }
  );
  if (!updated) throw conflict("The booking was changed by someone else, please reload");

  req.log.info("booking status changed", {
    bookingId: updated._id.toString(),
    from: booking.status,
    to,
  });
  await publishBookingEvent(
    EVENT_FOR_STATUS[to],
    updated,
    { previousStatus: booking.status, changedBy: role, ...(reason && { reason }) },
    req.log
  );

  res.json({ booking: updated });
};

// POST /bookings/:id/review
const reviewBooking = async (req, res) => {
  const booking = await findOwnBooking(req);
  if (booking.status !== "completed") throw conflict("You can only review a completed booking");

  const review = await Review.create({
    bookingId: booking._id,
    caretakerId: booking.caretakerId,
    userId: booking.userId,
    rating: req.valid.body.rating,
    reviewText: req.valid.body.reviewText,
  });

  const [stats] = await Review.aggregate([
    { $match: { caretakerId: booking.caretakerId } },
    { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);
  await Caretaker.updateOne(
    { _id: booking.caretakerId },
    { avgRating: Math.round(stats.avg * 10) / 10, reviewCount: stats.count }
  );

  res.status(201).json({ review });
};

module.exports = {
  createBooking,
  listBookings,
  getBooking,
  acceptBooking: changeStatus("accept"),
  rejectBooking: changeStatus("reject"),
  cancelBooking: changeStatus("cancel"),
  completeBooking: changeStatus("complete"),
  reviewBooking,
};
