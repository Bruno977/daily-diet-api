import { FastifyInstance } from "fastify";
import { z } from "zod";
import { knex } from "../database";
import { randomUUID } from "crypto";
import { checkUserIdExists } from "../middlewares/check-user-id-exists";

export async function MealsRoutes(app: FastifyInstance) {
  app.get("/", { preHandler: [checkUserIdExists] }, async (req, reply) => {
    const meals = await knex("meals").where({
      user_id: req.user?.id,
    });
    return reply.send({ meals });
  });
  app.get(
    "/:mealId",
    { preHandler: [checkUserIdExists] },
    async (req, reply) => {
      const createMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });
      const { mealId } = createMealParamsSchema.parse(req.params);

      const meal = await knex("meals")
        .where({ id: mealId, user_id: req.user?.id })
        .first();

      if (!meal) {
        return reply.status(404).send({ error: "Meal not found" });
      }

      return reply.send({ meal });
    }
  );
  app.post("/", { preHandler: [checkUserIdExists] }, async (req, reply) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      meal_time: z.string().datetime(),
      within_diet: z.boolean(),
    });

    const { name, description, within_diet, meal_time } =
      createMealBodySchema.parse(req.body);

    await knex("meals").insert({
      id: randomUUID(),
      user_id: req.user?.id,
      name,
      description,
      within_diet,
      meal_time,
    });

    return reply.status(201).send();
  });

  app.put(
    "/:mealId",
    { preHandler: [checkUserIdExists] },
    async (req, reply) => {
      const createMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });

      const { mealId } = createMealParamsSchema.parse(req.params);

      if (!mealId) {
        return reply.status(400).send({ error: "Meal ID not provided" });
      }

      const createMealBodySchema = z.object({
        name: z.string(),
        description: z.string(),
        within_diet: z.boolean(),
        meal_time: z.string().datetime(),
      });

      const { name, description, within_diet, meal_time } =
        createMealBodySchema.parse(req.body);

      const meal = await knex("meals")
        .where({ id: mealId, user_id: req.user?.id })
        .first();

      if (!meal) {
        return reply.status(404).send({ error: "Meal not found" });
      }

      await knex("meals")
        .where({
          user_id: req.user?.id,
          id: mealId,
        })
        .update({
          name,
          description,
          within_diet,
          meal_time,
        });
      return reply.status(204).send();
    }
  );

  app.delete(
    "/:mealId",
    { preHandler: [checkUserIdExists] },
    async (req, reply) => {
      const createMealParamsSchema = z.object({
        mealId: z.string().uuid(),
      });
      const { mealId } = createMealParamsSchema.parse(req.params);

      const meal = await knex("meals")
        .where({ id: mealId, user_id: req.user?.id })
        .first();

      if (!meal) {
        return reply.status(404).send({ error: "Meal not found" });
      }
      await knex("meals").where({ id: mealId, user_id: req.user?.id }).delete();
      return reply.status(204).send();
    }
  );
}
