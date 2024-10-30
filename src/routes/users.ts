import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID, UUID } from "node:crypto";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function usersRoutes(app: FastifyInstance) {
  app.get("/", async (req, reply) => {
    const users = await knex("users").select();
    return reply.send({ users });
  });
  app.get("/:id", async (req) => {
    const createUserParamsSchema = z.object({
      id: z.string(),
    });
    const { id } = createUserParamsSchema.parse(req.params);
    const user = await knex("users").where({ id }).first();
    return {
      user,
    };
  });
  app.get("/metrics", { preHandler: [checkUserIdExists] }, async (req) => {
    const userId = req.cookies.sessionId;

    const meals = await knex("meals").where({ user_id: userId });

    const { totalMeals, bestDietStreak, mealsOutOfDiet, mealsWithinDiet } =
      meals.reduce(
        (acc, item) => {
          acc.totalMeals += 1;
          if (item.within_diet) {
            acc.mealsWithinDiet += 1;
            acc.currentStreak += 1;
            acc.bestDietStreak = Math.max(
              acc.bestDietStreak,
              acc.currentStreak
            );
          } else {
            acc.mealsOutOfDiet += 1;
            acc.currentStreak = 0;
          }
          return acc;
        },
        {
          totalMeals: 0,
          mealsWithinDiet: 0,
          mealsOutOfDiet: 0,
          bestDietStreak: 0,
          currentStreak: 0,
        }
      );

    return { totalMeals, bestDietStreak, mealsOutOfDiet, mealsWithinDiet };
  });

  app.post("/", async (req, reply) => {
    const createUsersBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    });

    let sessionId = req.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.setCookie("sessionId", sessionId, {
        path: "/",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });
    }
    const { name, email } = createUsersBodySchema.parse(req.body);

    const user = await knex("users")
      .where({
        email,
      })
      .first();

    if (user) {
      return reply.status(400).send({ error: "User already exists" });
    }

    await knex("users").insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId,
    });
    return reply.status(201).send();
  });
}
