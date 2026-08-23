import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import jwt from "jsonwebtoken";
import app from "../index.js";
import User from "../models/UserModel.js";
import Site from "../models/SiteModel.js";
import Track from "../models/TrackModel.js";

let mongoServer;
let user1Token;
let user2Token;
let user1Id;
let user2Id;
let testSiteId;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);

  // Set fallback test secret
  process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret123";

  // Create two users for testing permission boundaries
  const user1 = await User.create({
    name: "User One",
    email: "user1@example.com",
    passwordHash: "dummyhash1",
  });
  user1Id = user1._id;
  user1Token = jwt.sign({ id: user1._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  const user2 = await User.create({
    name: "User Two",
    email: "user2@example.com",
    passwordHash: "dummyhash2",
  });
  user2Id = user2._id;
  user2Token = jwt.sign({ id: user2._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

  // Create a mock site
  const site = await Site.create({
    name: "Amazon Test",
    type: "product",
    priceLocation: ".price",
    nameLocation: ".name",
    imageLocation: ".img",
  });
  testSiteId = site._id.toString();
}, 60000);

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Track API", () => {
  let createdTrackId;

  describe("POST /api/track", () => {
    it("should successfully create a new track for authenticated user", async () => {
      const payload = {
        name: "Sony Headphones",
        url: "https://www.amazon.com/dp/B09XS7JWHH",
        site: testSiteId,
        type: "product",
        demandPrice: 249.99,
        telegramChatId: "12345678",
      };

      const res = await request(app)
        .post("/api/track")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty("_id");
      expect(res.body.name).toBe(payload.name);
      expect(res.body.demandPrice).toBe(payload.demandPrice);
      expect(res.body.user).toBe(user1Id.toString());

      createdTrackId = res.body._id;
    });

    it("should successfully create a new track with image field provided", async () => {
      const payload = {
        name: "Wireless Mouse",
        url: "https://www.amazon.com/dp/B09MOUSE12",
        site: testSiteId,
        type: "product",
        demandPrice: 29.99,
        image: "https://images.example.com/mouse.jpg",
      };

      const res = await request(app)
        .post("/api/track")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(payload)
        .expect(201);

      expect(res.body).toHaveProperty("_id");
      expect(res.body.image).toBe("https://images.example.com/mouse.jpg");
    });

    it("should reject creation when demandPrice is missing", async () => {
      const payload = {
        name: "Sony Headphones",
        url: "https://www.amazon.com/dp/B09XS7JWHH",
        site: testSiteId,
        type: "product",
        // demandPrice omitted intentionally
      };

      const res = await request(app)
        .post("/api/track")
        .set("Authorization", `Bearer ${user1Token}`)
        .send(payload)
        .expect(400);

      expect(res.body.message).toMatch(/demand price/i);
    });

    it("should reject request with no auth token", async () => {
      const payload = {
        name: "Sony Headphones",
        url: "https://www.amazon.com/dp/B09XS7JWHH",
        site: testSiteId,
        type: "product",
        demandPrice: 249.99,
      };

      await request(app)
        .post("/api/track")
        .send(payload)
        .expect(401);
    });
  });

  describe("GET /api/track", () => {
    it("should return only tracks belonging to the logged-in user", async () => {
      const res = await request(app)
        .get("/api/track")
        .set("Authorization", `Bearer ${user1Token}`)
        .expect(200);

      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThanOrEqual(1);
      expect(res.body[0].name).toBe("Sony Headphones");

      // User 2 should have 0 tracks
      const res2 = await request(app)
        .get("/api/track")
        .set("Authorization", `Bearer ${user2Token}`)
        .expect(200);

      expect(res2.body.length).toBe(0);
    });
  });

  describe("DELETE /api/track/:id", () => {
    it("should reject deleting another user's track with 403 Forbidden", async () => {
      const res = await request(app)
        .delete(`/api/track/${createdTrackId}`)
        .set("Authorization", `Bearer ${user2Token}`) // user2 trying to delete user1's track
        .expect(403);

      expect(res.body.message).toMatch(/not authorized to delete/i);
    });

    it("should allow the owner to delete their track", async () => {
      const res = await request(app)
        .delete(`/api/track/${createdTrackId}`)
        .set("Authorization", `Bearer ${user1Token}`) // user1 deleting their own track
        .expect(200);

      expect(res.body.message).toMatch(/removed successfully/i);

      // Verify deletion from DB
      const trackInDb = await Track.findById(createdTrackId);
      expect(trackInDb).toBeNull();
    });
  });
});
