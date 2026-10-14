const { badRequest } = require("../src/utils/AppError");

// validate(schema) checks req.body; validate(schema, "query") checks req.query.
// The parsed (trimmed/coerced) value is stored on req.valid[source].
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] ?? {});
  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));
    return next(badRequest("Validation failed", details));
  }
  req.valid = { ...req.valid, [source]: result.data };
  next();
};

module.exports = validate;
