const { randomUUID } = require("crypto");
const logger = require("../config/logger");

// Gives every request an id and a child logger (req.log), and logs one line
// per request with method, path, status and latency.
const requestLogger = (req, res, next) => {
  const requestId = req.header("x-request-id") || randomUUID();
  const fields = { requestId };

  // Cloud Run sends "X-Cloud-Trace-Context: TRACE_ID/SPAN_ID;o=1". Adding the
  // trace field groups all log lines of one request together in Logs Explorer.
  const traceHeader = req.header("x-cloud-trace-context");
  const projectId = process.env.GCP_PROJECT_ID;
  if (traceHeader && projectId) {
    fields["logging.googleapis.com/trace"] =
      `projects/${projectId}/traces/${traceHeader.split("/")[0]}`;
  }

  req.requestId = requestId;
  req.log = logger.child(fields);
  res.setHeader("x-request-id", requestId);

  const start = process.hrtime.bigint();
  res.on("finish", () => {
    const latencyMs = Number(process.hrtime.bigint() - start) / 1e6;
    const severity = res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warning" : "info";
    req.log[severity]("request completed", {
      method: req.method,
      path: req.originalUrl,
      status: res.statusCode,
      latencyMs: Math.round(latencyMs),
    });
  });

  next();
};

module.exports = requestLogger;
