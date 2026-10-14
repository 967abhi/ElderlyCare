const { handleCloudEvent } = require("../functions/src/handler");

const USER_ID = "6710a0000000000000000001";
const CARETAKER_ID = "6710a0000000000000000002";

const toCloudEvent = (event) => ({
  data: {
    message: { data: Buffer.from(JSON.stringify(event)).toString("base64"), messageId: "m1" },
  },
});

const makeEvent = (eventType, extra = {}) => ({
  eventId: `evt-${Math.random()}`,
  eventType,
  occurredAt: new Date().toISOString(),
  version: 1,
  data: {
    bookingId: "b1",
    userId: USER_ID,
    caretakerId: CARETAKER_ID,
    startTime: "2026-10-12T04:30:00.000Z",
    endTime: "2026-10-12T07:30:00.000Z",
    hours: 3,
    hourlyRate: 300,
    totalPrice: 900,
    serviceAddress: "12 MG Road",
    ...extra,
  },
});

// In-memory fake of deps.js
const makeDeps = (overrides = {}) => {
  const processed = new Set();
  const deps = {
    sent: [],
    logs: [],
    getUser: async () => ({
      firstname: "Asha",
      lastname: "Rao",
      email: "asha@example.com",
      familyContacts: [
        { name: "Priya", email: "priya@example.com", notify: true },
        { name: "Muted", email: "muted@example.com", notify: false },
        { name: "PhoneOnly", phone: "999" },
      ],
    }),
    getCaretaker: async () => ({ firstname: "Ravi", lastname: "Kumar", email: "ravi@example.com" }),
    isProcessed: async (key) => processed.has(key),
    markProcessed: async (key) => processed.add(key),
    sendEmail: async (msg) => deps.sent.push(msg),
    log: (severity, message, fields) => deps.logs.push({ severity, message, ...fields }),
    ...overrides,
  };
  return deps;
};

test("notifyCaretaker emails the caretaker about a new booking", async () => {
  const deps = makeDeps();
  const result = await handleCloudEvent("notifyCaretaker", toCloudEvent(makeEvent("booking.created")), deps);
  expect(result).toMatchObject({ status: "done", sent: 1 });
  expect(deps.sent[0].to).toBe("ravi@example.com");
  expect(deps.sent[0].subject).toMatch(/New booking request/);
  expect(deps.sent[0].text).toMatch(/Asha Rao has requested a visit/);
});

test("notifyFamily emails the user and family contacts that opted in", async () => {
  const deps = makeDeps();
  await handleCloudEvent("notifyFamily", toCloudEvent(makeEvent("booking.accepted")), deps);
  expect(deps.sent.map((m) => m.to)).toEqual(["asha@example.com", "priya@example.com"]);
  expect(deps.sent[0].text).toMatch(/accepted your booking/);
  expect(deps.sent[1].text).toMatch(/accepted Asha Rao's booking/);
});

test("each function ignores event types it does not handle", async () => {
  const deps = makeDeps();
  expect((await handleCloudEvent("notifyFamily", toCloudEvent(makeEvent("booking.created")), deps)).status).toBe("ignored");
  expect((await handleCloudEvent("notifyCaretaker", toCloudEvent(makeEvent("booking.accepted")), deps)).status).toBe("ignored");
  expect(deps.sent).toHaveLength(0);
});

test("a redelivered event is not sent twice", async () => {
  const deps = makeDeps();
  const cloudEvent = toCloudEvent(makeEvent("booking.completed"));
  await handleCloudEvent("notifyFamily", cloudEvent, deps);
  const second = await handleCloudEvent("notifyFamily", cloudEvent, deps);
  expect(second).toMatchObject({ sent: 0, duplicates: 2 });
  expect(deps.sent).toHaveLength(2);
});

test("a temporary email failure throws (so Pub/Sub retries) and the retry only sends what is missing", async () => {
  let failFor = "priya@example.com";
  const deps = makeDeps();
  deps.sendEmail = async (msg) => {
    if (msg.to === failFor) throw Object.assign(new Error("connection timeout"), { code: "ETIMEDOUT" });
    deps.sent.push(msg);
  };
  const cloudEvent = toCloudEvent(makeEvent("booking.rejected", { reason: "Unwell" }));

  await expect(handleCloudEvent("notifyFamily", cloudEvent, deps)).rejects.toThrow("connection timeout");
  expect(deps.sent.map((m) => m.to)).toEqual(["asha@example.com"]);
  expect(deps.logs.some((l) => l.severity === "ERROR")).toBe(true);

  failFor = null;
  await handleCloudEvent("notifyFamily", cloudEvent, deps);
  expect(deps.sent.map((m) => m.to)).toEqual(["asha@example.com", "priya@example.com"]);
  expect(deps.sent[1].text).toMatch(/Reason: Unwell/);
});

test("permanent failures are logged and not retried", async () => {
  const deps = makeDeps({ getCaretaker: async () => null });
  const result = await handleCloudEvent("notifyCaretaker", toCloudEvent(makeEvent("booking.created")), deps);
  expect(result.status).toBe("skipped");
  expect(deps.logs.at(-1).severity).toBe("WARNING");

  const bounce = makeDeps({
    sendEmail: async () => {
      throw Object.assign(new Error("550 mailbox unavailable"), { responseCode: 550 });
    },
  });
  await expect(
    handleCloudEvent("notifyCaretaker", toCloudEvent(makeEvent("booking.created")), bounce)
  ).resolves.toMatchObject({ status: "done", sent: 0 });
});

test("invalid messages are dropped instead of retried forever", async () => {
  const deps = makeDeps();
  const bad = { data: { message: { data: Buffer.from("not json").toString("base64") } } };
  expect((await handleCloudEvent("notifyFamily", bad, deps)).status).toBe("invalid");
});
