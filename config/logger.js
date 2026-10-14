// Structured JSON logger. Cloud Run / Cloud Functions parse one JSON object per
// stdout line, and the `severity` field becomes the log level in Cloud Logging.
const SEVERITIES = ["DEBUG", "INFO", "WARNING", "ERROR"];

function write(severity, message, fields = {}) {
  if (process.env.NODE_ENV === "test" && !process.env.LOG_IN_TESTS) return;

  const entry = { severity, message, time: new Date().toISOString(), ...fields };
  if (entry.err instanceof Error) {
    entry.err = { name: entry.err.name, message: entry.err.message, stack: entry.err.stack };
  }
  const line = JSON.stringify(entry);
  if (severity === "ERROR" || severity === "WARNING") console.error(line);
  else console.log(line);
}

// child() returns a logger that adds the same fields (requestId, trace, ...) to every line
function createLogger(baseFields = {}) {
  const logger = {};
  for (const severity of SEVERITIES) {
    logger[severity.toLowerCase()] = (message, fields) =>
      write(severity, message, { ...baseFields, ...fields });
  }
  logger.warn = logger.warning;
  logger.child = (fields) => createLogger({ ...baseFields, ...fields });
  return logger;
}

module.exports = createLogger();
