import { afterAll, beforeAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

describe("Users Routes", () => {
  beforeAll(async () => {
    app.ready();
  });
  afterAll(async () => {
    app.close();
  });
  beforeEach(() => {
    execSync("npm run knex migrate:rollback --all");
    execSync("npm run knex migrate:latest");
  });
  it("should create a new user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Bruno Teste",
        email: "bruno@example.com",
      })
      .expect(201);
  });
  it("should return a list of users", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Bruno Teste",
        email: "bruno@example.com",
      })
      .expect(201);
    await request(app.server)
      .post("/users")
      .send({
        name: "Bruno Teste 2",
        email: "bruno2@example.com",
      })
      .expect(201);

    const users = await request(app.server).get("/users").expect(200);
    expect(users.body.users.length).toBe(2);
    expect(users.body.users).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Bruno Teste",
          email: "bruno@example.com",
        }),
        expect.objectContaining({
          name: "Bruno Teste 2",
          email: "bruno2@example.com",
        }),
      ])
    );
  });

  it("should return a specific user", async () => {
    await request(app.server)
      .post("/users")
      .send({
        name: "Bruno Teste",
        email: "bruno@example.com",
      })
      .expect(201);

    const users = await request(app.server).get("/users").expect(200);
    const userId = await users.body.users[0].id;

    const user = await request(app.server).get(`/users/${userId}`).expect(200);

    expect(user.body.user).toEqual(
      expect.objectContaining({
        name: "Bruno Teste",
        email: "bruno@example.com",
      })
    );
  });
});
