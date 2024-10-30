import fastify from "fastify";
import { env } from "./env";
import cookie from "@fastify/cookie";
import { usersRoutes } from "./routes/users";
import { MealsRoutes } from "./routes/meals";

export const app = fastify();

app.register(cookie);

app.register(usersRoutes, {
  prefix: "/users",
});
app.register(MealsRoutes, {
  prefix: "/meals",
});
