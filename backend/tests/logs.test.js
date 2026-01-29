const request = require("supertest");
const fs = require("fs-extra");
const path = require("path");

const LOG_FILE = path.join(__dirname, "../data/logs.ndjson");
const server = require("../server");

beforeEach(async () => {
  await fs.outputFile(LOG_FILE, ""); // wipe file
});


describe("POST /logs", () => {
  it("should reject invalid payload", async () => {
    const res = await request(server)
      .post("/logs")
      .send({ level: "error" });

    expect(res.statusCode).toBe(400);
  });

  it("should accept valid log", async () => {
    const res = await request(server).post("/logs").send({
      level: "info",
      message: "Test log",
      resourceId: "server-1",
      timestamp: new Date().toISOString(),
      traceId: "t1",
      spanId: "s1",
      commit: "abc123",
      metadata: {}
    });

    expect(res.statusCode).toBe(201);
  });
});

describe("GET /logs", () => {
  it("should filter by level", async () => {
    await request(server).post("/logs").send({
      level: "error",
      message: "Error happened",
      resourceId: "r1",
      timestamp: new Date().toISOString(),
      traceId: "t1",
      spanId: "s1",
      commit: "c1",
      metadata: {}
    });

    const res = await request(server).get("/logs?level=error");
    expect(res.body.length).toBe(1);
  });

  it("should filter by date range", async () => {
    const now = new Date();
    const past = new Date(now.getTime() - 1000 * 60);

    await request(server).post("/logs").send({
      level: "info",
      message: "Old log",
      resourceId: "r1",
      timestamp: past.toISOString(),
      traceId: "t1",
      spanId: "s1",
      commit: "c1",
      metadata: {}
    });

    const res = await request(server).get(
      `/logs?from=${now.toISOString()}`
    );

    expect(res.body.length).toBe(0);
  });
});
