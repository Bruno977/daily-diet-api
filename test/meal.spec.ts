import { afterAll, beforeAll, beforeEach, describe, it, expect } from "vitest";
import request from "supertest";
import { app } from "../src/app";
import { execSync } from "child_process";

async function createNewUser() {
  const user = await request(app.server)
    .post("/users")
    .send({
      name: "Bruno Teste",
      email: "bruno@example.com",
    })
    .expect(201);
  return user;
}

describe("Meals Routes", () => {
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
  it("should create a new meal", async () => {
    const user = await createNewUser();
    const sessionId = user.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);
  });

  it("should list all meals", async () => {
    const user = await createNewUser();
    const sessionId = user.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 2",
        description: "Descrição 2",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);
    const meals = await request(app.server)
      .get("/meals")
      .set("Cookie", sessionId!)
      .expect(200);

    expect(meals.body.meals).toHaveLength(2);

    expect(meals.body.meals).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "Refeição 1",
          description: "Descrição 1",
          within_diet: 0,
          meal_time: "2024-10-28T08:00:00Z",
        }),
        expect.objectContaining({
          name: "Refeição 2",
          description: "Descrição 2",
          within_diet: 0,
          meal_time: "2024-10-28T08:00:00Z",
        }),
      ])
    );
  });

  it("should return a specific meal", async () => {
    const user = await createNewUser();
    const sessionId = user.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);

    const meals = await request(app.server)
      .get("/meals")
      .set("Cookie", sessionId!)
      .expect(200);
    const mealId = meals.body.meals[0].id;

    const meal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set("Cookie", sessionId!)
      .expect(200);

    expect(meal.body.meal).toEqual(
      expect.objectContaining({
        id: mealId,
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: 0,
        meal_time: "2024-10-28T08:00:00Z",
      })
    );
  });

  it("should update a meal", async () => {
    const user = await createNewUser();
    const sessionId = user.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);

    const meals = await request(app.server)
      .get("/meals")
      .set("Cookie", sessionId!)
      .expect(200);
    const mealId = meals.body.meals[0].id;

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1 atualizada",
        description: "Descrição 1 atualizada",
        within_diet: true,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(204);
  });

  it("should remove a meal", async () => {
    const user = await createNewUser();
    const sessionId = user.get("Set-Cookie");

    await request(app.server)
      .post("/meals")
      .set("Cookie", sessionId!)
      .send({
        name: "Refeição 1",
        description: "Descrição 1",
        within_diet: false,
        meal_time: "2024-10-28T08:00:00Z",
      })
      .expect(201);

    const meals = await request(app.server)
      .get("/meals")
      .set("Cookie", sessionId!)
      .expect(200);
    const mealId = meals.body.meals[0].id;

    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set("Cookie", sessionId!)
      .expect(204);
  });
});
