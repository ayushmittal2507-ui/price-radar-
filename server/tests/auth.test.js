import mongoose from "mongoose";
import request from "supertest";
import { MongoMemoryServer } from "mongodb-memory-server";
import app from "../index.js";
import User from "../models/UserModel.js";

let mongoServer;

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
}, 60000); // 60s timeout for initial binary download

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});

describe("Auth API", () => {
  const testUser = {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  };

  describe("POST /api/auth/signup", () => {
    it("should successfully register a new user and return a JWT", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe(testUser.email);
      expect(response.body.name).toBe(testUser.name);
    });

    it("should fail when registering with an existing email", async () => {
      const response = await request(app)
        .post("/api/auth/signup")
        .send(testUser)
        .expect(400);

      expect(response.body.message).toBe("User already exists with this email");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should log in successfully with valid credentials and return a JWT", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(200);

      expect(response.body).toHaveProperty("token");
      expect(response.body.email).toBe(testUser.email);
    });

    it("should fail to log in with an incorrect password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({
          email: testUser.email,
          password: "wrongpassword",
        })
        .expect(401);

      expect(response.body.message).toBe("Invalid email or password");
    });
  });
});
