const request = require("supertest");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const bcrypt = require("bcryptjs");

process.env.JWT_SECRET = "test_secret";
process.env.NODE_ENV = "test";

// first-time mongo download can take time
jest.setTimeout(60000);

const app = require("../src/app");
const User = require("../src/models/User");
const Task = require("../src/models/Task");

let mongo = null;

async function login(email, password) {
  const res = await request(app).post("/api/auth/login").send({ email, password });
  return res.body.token; // change if your API returns different key
}

describe("RBAC tests", () => {
  beforeAll(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());

    // ✅ Create users with passwordHash (your schema requires it)
    const adminHash = await bcrypt.hash("password123", 10);
    const memberHash = await bcrypt.hash("password123", 10);

    await User.create({
      name: "Manager User",
      email: "admin@example.com",
      role: "admin",
      passwordHash: adminHash,
    });

    await User.create({
      name: "Member User",
      email: "member@example.com",
      role: "member",
      passwordHash: memberHash,
    });
  });

  afterAll(async () => {
    try {
      await mongoose.disconnect();
    } catch {}

    if (mongo) {
      try {
        await mongo.stop();
      } catch {}
    }
  });

  test("Member cannot access /api/users", async () => {
    const token = await login("member@example.com", "password123");

    const res = await request(app)
      .get("/api/users")
      .set("Authorization", `Bearer ${token}`);

    expect([401, 403]).toContain(res.status);
  });

  test("Admin can create task; Member cannot create task", async () => {
    const adminToken = await login("admin@example.com", "password123");
    const memberToken = await login("member@example.com", "password123");

    const member = await User.findOne({ email: "member@example.com" });

    const adminCreate = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Test Task",
        description: "Created by admin",
        assignedTo: member._id.toString(),
        status: "Todo",
      });

    expect(adminCreate.status).toBe(201);
    expect(adminCreate.body.createdBy).toBeTruthy();
    expect(adminCreate.body.updatedBy).toBeTruthy();

    const memberCreate = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${memberToken}`)
      .send({
        title: "Member Task",
        assignedTo: member._id.toString(),
      });

    expect([401, 403]).toContain(memberCreate.status);
  });

  test("Member can update status of own task, but cannot update others", async () => {
    const adminToken = await login("admin@example.com", "password123");
    const memberToken = await login("member@example.com", "password123");

    const member = await User.findOne({ email: "member@example.com" });

    const created = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Status Task",
        assignedTo: member._id.toString(),
        status: "Todo",
      });

    expect(created.status).toBe(201);

    const ok = await request(app)
      .patch(`/api/tasks/${created.body._id}/status`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "In Progress" });

    expect(ok.status).toBe(200);
    expect(ok.body.status).toBe("In Progress");

    const admin = await User.findOne({ email: "admin@example.com" });

    const otherTask = await Task.create({
      title: "Other Task",
      assignedTo: admin._id,
      status: "Todo",
      createdBy: admin._id,
      updatedBy: admin._id,
    });

    const bad = await request(app)
      .patch(`/api/tasks/${otherTask._id}/status`)
      .set("Authorization", `Bearer ${memberToken}`)
      .send({ status: "Done" });

    expect([401, 403]).toContain(bad.status);
  });

  test("Admin task list supports pagination shape", async () => {
    const adminToken = await login("admin@example.com", "password123");

    const res = await request(app)
      .get("/api/tasks?page=1&limit=5")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("items");
    expect(res.body).toHaveProperty("page");
    expect(res.body).toHaveProperty("pages");
    expect(res.body).toHaveProperty("total");
  });
});
