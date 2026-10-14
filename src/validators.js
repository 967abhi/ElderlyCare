const { z } = require("zod");

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");
const phone = z.coerce.number().int().positive();
const pincode = z.coerce.number().int().min(100000).max(999999);
const password = z.string().min(8, "Password must be at least 8 characters").max(72);
const email = z.email().transform((v) => v.toLowerCase());

const login = z.object({
  email,
  password: z.string().min(1),
});

const registerUser = z.object({
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  age: z.coerce.number().int().min(1).max(130),
  phonenumber: phone,
  email,
  gender: z.enum(["male", "female", "other"]),
  password,
  address: z.string().trim().min(1),
  pincode,
  city: z.string().trim().optional(),
  description: z.string().trim().max(500).optional(),
});

const updateUser = z
  .object({
    firstname: z.string().trim().min(1),
    lastname: z.string().trim().min(1),
    age: z.coerce.number().int().min(1).max(130),
    phonenumber: phone,
    address: z.string().trim().min(1),
    pincode,
    currentAddress: z.string().trim(),
    city: z.string().trim(),
    currentpincode: pincode,
    description: z.string().trim().max(500),
    password,
  })
  .partial()
  .strict();

const familyContact = z
  .object({
    name: z.string().trim().min(1),
    relation: z.string().trim().optional(),
    email: email.optional(),
    phone: z.string().trim().optional(),
    notify: z.boolean().optional(),
  })
  .refine((c) => c.email || c.phone, { message: "Either email or phone is required" });

const updateFamilyContact = z
  .object({
    name: z.string().trim().min(1),
    relation: z.string().trim(),
    email,
    phone: z.string().trim(),
    notify: z.boolean(),
  })
  .partial()
  .strict();

const registerCaretaker = z.object({
  firstname: z.string().trim().min(1),
  lastname: z.string().trim().min(1),
  age: z.coerce.number().int().min(18).max(100),
  email,
  address: z.string().trim().min(1),
  phonenumber: phone,
  password,
  pincode,
  hourlyRate: z.coerce.number().positive(),
  skills: z.array(z.string().trim().min(1)).optional(),
  experienceYears: z.coerce.number().min(0).optional(),
  description: z.string().trim().max(200).optional(),
});

const updateCaretaker = z
  .object({
    firstname: z.string().trim().min(1),
    lastname: z.string().trim().min(1),
    age: z.coerce.number().int().min(18).max(100),
    address: z.string().trim().min(1),
    phonenumber: phone,
    pincode,
    hourlyRate: z.coerce.number().positive(),
    skills: z.array(z.string().trim().min(1)),
    experienceYears: z.coerce.number().min(0),
    description: z.string().trim().max(200),
    isAvailable: z.boolean(),
    password,
  })
  .partial()
  .strict();

const pagination = {
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
};

const searchCaretakers = z.object({
  pincode: pincode.optional(),
  skill: z.string().trim().min(1).optional(),
  minRating: z.coerce.number().min(0).max(5).optional(),
  ...pagination,
});

const createBooking = z.object({
  caretakerId: objectId,
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  serviceAddress: z.string().trim().min(1).optional(),
  pincode: pincode.optional(),
  notes: z.string().trim().max(500).optional(),
});

const listBookings = z.object({
  status: z.enum(["pending", "accepted", "rejected", "cancelled", "completed"]).optional(),
  ...pagination,
});

const statusChange = z.object({
  reason: z.string().trim().max(300).optional(),
});

const createReview = z.object({
  rating: z.coerce.number().min(0).max(5),
  reviewText: z.string().trim().min(1).max(500),
});

module.exports = {
  objectId,
  login,
  registerUser,
  updateUser,
  familyContact,
  updateFamilyContact,
  registerCaretaker,
  updateCaretaker,
  searchCaretakers,
  createBooking,
  listBookings,
  statusChange,
  createReview,
};
