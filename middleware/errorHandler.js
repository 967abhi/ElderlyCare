const mongoose = require("mongoose");
const logger = require("../config/logger");
const { AppError } = require("../src/utils/AppError");

const notFoundHandler = (req, res) => {
  res.status(404).json({ error: { code: "NOT_FOUND", message: `No route ${req.method} ${req.path}` } });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = err;

  if (err instanceof mongoose.Error.CastError) {
    error = new AppError(400, "BAD_REQUEST", `Invalid ${err.path}`);
  } else if (err instanceof mongoose.Error.ValidationError) {
    error = new AppError(400, "BAD_REQUEST", err.message);
  } else if (err && err.code === 11000) {
    error = new AppError(409, "CONFLICT", "A record with these details already exists");
  } else if (err && err.type === "entity.parse.failed") {
    error = new AppError(400, "BAD_REQUEST", "Request body is not valid JSON");
  }

  if (!(error instanceof AppError)) {
    (req.log || logger).error("unhandled error", { err });
    error = new AppError(500, "INTERNAL", "Something went wrong");
  }

  const body = { error: { code: error.code, message: error.message } };
  if (error.details) body.error.details = error.details;
  res.status(error.status).json(body);
};

module.exports = { errorHandler, notFoundHandler };
