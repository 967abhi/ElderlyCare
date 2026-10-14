process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";
process.env.PUBSUB_BOOKING_TOPIC = "booking-events-test";
process.env.PUBSUB_PUBLISH_TIMEOUT_MS = "200";

const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const app = require("../src/app");
const Booking = require("../src/models/bookingmodel");
const OutboxEvent = require("../src/models/outboxeventmodel");
const { _setTopic } = require("../src/events/publishBookingEvent");
const { flushOutbox } = require("../src/events/outbox");

// Fake Pub/Sub topic: records published messages, can be told to fail
const published = [];
let failPublish = false;
_setTopic({
  publishMessage: async (msg) => {
    if (failPublish) throw new Error("pubsub unavailable");
    published.push(msg);
    return `msg-${published.length}`;
  },
});

let mongo;
beforeAll(async () => {
  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri());
  await Promise.all(mongoose.modelNames().map((name) => mongoose.model(name).syncIndexes()));
});
afterAll(async () => {
  await mongoose.disconnect();
  await mongo.stop();
});

const api = request(app);
const HOUR = 60 * 60 * 1000;
const future = (hoursFromNow) => new Date(Date.now() + hoursFromNow * HOUR).toISOString();

let counter = 0;
const registerUser = async (overrides = {}) => {
  counter += 1;
  const res = await api.post("/api/v1/auth/users/register").send({
    firstname: "Asha",
    lastname: "Rao",
    age: 72,
    phonenumber: 9000000000 + counter,
    email: `user${counter}@example.com`,
    gender: "female",
    password: "password123",
    address: "12 MG Road",
    pincode: 560001,
    ...overrides,
  });
  expect(res.status).toBe(201);
  return res.body;
};

const registerCaretaker = async (overrides = {}) => {
  counter += 1;
  const res = await api.post("/api/v1/auth/caretakers/register").send({
    firstname: "Ravi",
    lastname: "Kumar",
    age: 30,
    email: `caretaker${counter}@example.com`,
    address: "5 Park St",
    phonenumber: 8000000000 + counter,
    password: "password123",
    pincode: 560001,
    hourlyRate: 300,
    skills: ["Dementia care"],
    ...overrides,
  });
  expect(res.status).toBe(201);
  return res.body;
};

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

describe("auth", () => {
  test("register and login a user without returning the password", async () => {
    const { account } = await registerUser({ email: "login@example.com" });
    expect(account.password).toBeUndefined();

    const res = await api
      .post("/api/v1/auth/users/login")
      .send({ email: "login@example.com", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.account.password).toBeUndefined();
    expect(res.headers["set-cookie"][0]).toMatch(/access_token=.*HttpOnly/);
  });

  test("wrong password is rejected", async () => {
    await registerUser({ email: "wrong@example.com" });
    const res = await api
      .post("/api/v1/auth/users/login")
      .send({ email: "wrong@example.com", password: "nope-nope" });
    expect(res.status).toBe(401);
  });

  test("duplicate email returns 409", async () => {
    await registerUser({ email: "dup@example.com" });
    const res = await api.post("/api/v1/auth/users/register").send({
      firstname: "A", lastname: "B", age: 70, phonenumber: 9111111111, email: "dup@example.com",
      gender: "male", password: "password123", address: "x", pincode: 560001,
    });
    expect(res.status).toBe(409);
  });

  test("invalid body returns 400 with field details", async () => {
    const res = await api.post("/api/v1/auth/users/register").send({ email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.error.details.some((d) => d.field === "email")).toBe(true);
  });

  test("cookie auth works and roles are enforced", async () => {
    const agent = request.agent(app);
    const { account } = await registerCaretaker();
    await agent
      .post("/api/v1/auth/caretakers/login")
      .send({ email: account.email, password: "password123" })
      .expect(200);
    await agent.get("/api/v1/caretakers/me").expect(200);
    await agent.get("/api/v1/users/me").expect(403);
    await api.get("/api/v1/users/me").expect(401);
  });
});

describe("family contacts", () => {
  test("add, update, list and remove", async () => {
    const { token } = await registerUser();
    const add = await api
      .post("/api/v1/users/me/family-contacts")
      .set(bearer(token))
      .send({ name: "Priya", relation: "daughter", email: "priya@example.com" });
    expect(add.status).toBe(201);
    const id = add.body.familyContact._id;

    await api
      .patch(`/api/v1/users/me/family-contacts/${id}`)
      .set(bearer(token))
      .send({ notify: false })
      .expect(200);

    const list = await api.get("/api/v1/users/me/family-contacts").set(bearer(token));
    expect(list.body.familyContacts).toHaveLength(1);
    expect(list.body.familyContacts[0].notify).toBe(false);

    await api.delete(`/api/v1/users/me/family-contacts/${id}`).set(bearer(token)).expect(204);
  });

  test("a contact needs an email or phone", async () => {
    const { token } = await registerUser();
    await api
      .post("/api/v1/users/me/family-contacts")
      .set(bearer(token))
      .send({ name: "No Contact" })
      .expect(400);
  });
});

describe("caretaker search", () => {
  test("filters by pincode and skill and hides passwords", async () => {
    const { token } = await registerUser();
    await registerCaretaker({ pincode: 400001, skills: ["Physiotherapy"] });

    const res = await api
      .get("/api/v1/caretakers?pincode=400001&skill=physiotherapy")
      .set(bearer(token));
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.caretakers[0].password).toBeUndefined();
    expect(res.body.caretakers[0].userfirstname).toBeUndefined();
  });
});

describe("bookings", () => {
  let user;
  let caretaker;

  beforeEach(async () => {
    published.length = 0;
    failPublish = false;
    user = await registerUser();
    caretaker = await registerCaretaker();
  });

  const book = (start = 24, length = 3, token = user.token) =>
    api
      .post("/api/v1/bookings")
      .set(bearer(token))
      .send({
        caretakerId: caretaker.account._id,
        startTime: future(start),
        endTime: future(start + length),
      });

  test("creates a booking with a server-side price and publishes booking.created", async () => {
    const res = await book(24, 3);
    expect(res.status).toBe(201);
    expect(res.body.booking).toMatchObject({ hours: 3, hourlyRate: 300, totalPrice: 900, status: "pending" });
    expect(res.body.booking.serviceAddress).toBe("12 MG Road");

    expect(published).toHaveLength(1);
    const { json, attributes } = published[0];
    expect(json.eventType).toBe("booking.created");
    expect(json.eventId).toBeDefined();
    expect(json.data.bookingId).toBe(res.body.booking._id);
    expect(attributes).toEqual({ eventType: "booking.created", bookingId: res.body.booking._id });
  });

  test("rejects overlapping bookings for the same caretaker", async () => {
    await book(24, 3).expect(201);
    const res = await book(25, 2);
    expect(res.status).toBe(409);
  });

  test("rejects invalid lengths and past start times", async () => {
    expect((await book(24, 0.25)).status).toBe(400);
    expect((await book(24, 1.25)).status).toBe(400);
    expect((await book(24, 13)).status).toBe(400);
    expect((await book(-2, 3)).status).toBe(400);
  });

  test("caretaker accepts; the user cannot accept; others get 404", async () => {
    const { body } = await book();
    const id = body.booking._id;

    await api.patch(`/api/v1/bookings/${id}/accept`).set(bearer(user.token)).expect(403);

    const other = await registerCaretaker();
    await api.patch(`/api/v1/bookings/${id}/accept`).set(bearer(other.token)).expect(404);

    const res = await api.patch(`/api/v1/bookings/${id}/accept`).set(bearer(caretaker.token));
    expect(res.status).toBe(200);
    expect(res.body.booking.status).toBe("accepted");
    expect(published.map((m) => m.json.eventType)).toEqual(["booking.created", "booking.accepted"]);

    // accepting twice is not allowed
    await api.patch(`/api/v1/bookings/${id}/accept`).set(bearer(caretaker.token)).expect(409);
  });

  test("user cancels with a reason", async () => {
    const { body } = await book();
    const res = await api
      .patch(`/api/v1/bookings/${body.booking._id}/cancel`)
      .set(bearer(user.token))
      .send({ reason: "Feeling better" });
    expect(res.status).toBe(200);
    const event = published[1].json;
    expect(event.eventType).toBe("booking.cancelled");
    expect(event.data).toMatchObject({ previousStatus: "pending", changedBy: "user", reason: "Feeling better" });
  });

  test("complete only after start, then review updates the rating once", async () => {
    const { body } = await book();
    const id = body.booking._id;
    await api.patch(`/api/v1/bookings/${id}/accept`).set(bearer(caretaker.token)).expect(200);
    await api.patch(`/api/v1/bookings/${id}/complete`).set(bearer(caretaker.token)).expect(409);

    // pretend the booking has already started
    await Booking.updateOne({ _id: id }, { startTime: new Date(Date.now() - HOUR) });
    await api.patch(`/api/v1/bookings/${id}/complete`).set(bearer(caretaker.token)).expect(200);
    expect(published.at(-1).json.eventType).toBe("booking.completed");

    const review = await api
      .post(`/api/v1/bookings/${id}/review`)
      .set(bearer(user.token))
      .send({ rating: 4, reviewText: "Very caring" });
    expect(review.status).toBe(201);

    await api
      .post(`/api/v1/bookings/${id}/review`)
      .set(bearer(user.token))
      .send({ rating: 5, reviewText: "Again" })
      .expect(409);

    const detail = await api.get(`/api/v1/caretakers/${caretaker.account._id}`).set(bearer(user.token));
    expect(detail.body.caretaker).toMatchObject({ avgRating: 4, reviewCount: 1 });
    expect(detail.body.reviews).toHaveLength(1);
  });

  test("lists bookings for both sides", async () => {
    await book(24, 2);
    await book(48, 2);
    const mine = await api.get("/api/v1/bookings").set(bearer(user.token));
    expect(mine.body.total).toBe(2);
    const theirs = await api.get("/api/v1/bookings?status=pending").set(bearer(caretaker.token));
    expect(theirs.body.total).toBe(2);
  });

  test("if Pub/Sub fails the booking is still saved and the event goes to the outbox", async () => {
    failPublish = true;
    const res = await book();
    expect(res.status).toBe(201);
    expect(published).toHaveLength(0);

    const pending = await OutboxEvent.find();
    expect(pending).toHaveLength(1);
    const { eventId } = pending[0];

    failPublish = false;
    const result = await flushOutbox();
    expect(result).toEqual({ published: 1, failed: 0 });
    expect(published[0].json.eventId).toBe(eventId); // same id, so consumers can de-duplicate
    expect(await OutboxEvent.countDocuments()).toBe(0);
  });
});

describe("misc", () => {
  test("healthz and unknown routes", async () => {
    await api.get("/healthz").expect(200);
    const res = await api.get("/api/v1/does-not-exist");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });

  test("invalid ids return 400", async () => {
    const { token } = await registerUser();
    await api.get("/api/v1/bookings/not-an-id").set(bearer(token)).expect(400);
  });
});
