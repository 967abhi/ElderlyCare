// Real dependencies for the handler: MongoDB lookups, de-duplication store, email, logging.
const { MongoClient, ObjectId } = require("mongodb");
const nodemailer = require("nodemailer");

// Reused across invocations of the same function instance
let clientPromise;
const getDb = async () => {
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not set");
  if (!clientPromise) {
    clientPromise = MongoClient.connect(process.env.MONGO_URI, { maxPoolSize: 5 }).catch((err) => {
      clientPromise = undefined; // try again on the next invocation
      throw err;
    });
  }
  const client = await clientPromise;
  // same database the API uses (the one in MONGO_URI, or "test" if none)
  return client.db(process.env.MONGO_DB_NAME || undefined);
};

let indexesReady;
const processedEvents = async () => {
  const col = (await getDb()).collection("processed_events");
  if (!indexesReady) {
    indexesReady = Promise.all([
      col.createIndex({ key: 1 }, { unique: true }),
      // forget processed keys after 7 days (Pub/Sub keeps messages for 7 days max)
      col.createIndex({ processedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 }),
    ]).catch((err) => {
      indexesReady = undefined;
      throw err;
    });
  }
  await indexesReady;
  return col;
};

const toId = (id) => (ObjectId.isValid(id) ? new ObjectId(id) : null);

const getUser = async (id) => {
  const _id = toId(id);
  if (!_id) return null;
  return (await getDb())
    .collection("users")
    .findOne({ _id }, { projection: { firstname: 1, lastname: 1, email: 1, familyContacts: 1 } });
};

const getCaretaker = async (id) => {
  const _id = toId(id);
  if (!_id) return null;
  return (await getDb())
    .collection("caretakers")
    .findOne({ _id }, { projection: { firstname: 1, lastname: 1, email: 1 } });
};

const isProcessed = async (key) => Boolean(await (await processedEvents()).findOne({ key }));

const markProcessed = async (key) => {
  await (await processedEvents()).updateOne(
    { key },
    { $setOnInsert: { key, processedAt: new Date() } },
    { upsert: true }
  );
};

let transporter;
const sendEmail = async ({ to, subject, text, html }) => {
  // No SMTP configured: log the email instead of sending (local testing)
  if (!process.env.SMTP_HOST) {
    log("INFO", "DRY RUN email (SMTP_HOST not set)", { to, subject, text });
    return;
  }
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: port === 465,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  });
};

// Structured log line for Cloud Logging
const log = (severity, message, fields = {}) => {
  const line = JSON.stringify({ severity, message, ...fields });
  if (severity === "ERROR" || severity === "WARNING") console.error(line);
  else console.log(line);
};

module.exports = { getUser, getCaretaker, isProcessed, markProcessed, sendEmail, log };
