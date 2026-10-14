// Errors thrown with an HTTP status and a machine-readable code.
// The error handler turns them into { error: { code, message } } responses.
class AppError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const badRequest = (message, details) => new AppError(400, "BAD_REQUEST", message, details);
const unauthorized = (message = "Authentication required") =>
  new AppError(401, "UNAUTHORIZED", message);
const forbidden = (message = "You are not allowed to do this") =>
  new AppError(403, "FORBIDDEN", message);
const notFound = (message = "Not found") => new AppError(404, "NOT_FOUND", message);
const conflict = (message) => new AppError(409, "CONFLICT", message);

// Wraps async route handlers so rejected promises reach the error handler
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { AppError, badRequest, unauthorized, forbidden, notFound, conflict, asyncHandler };
