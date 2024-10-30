import { Knex } from "knex";
import { userType } from "./user";

declare module "fastify" {
  export interface FastifyRequest {
    user?: userType;
  }
}
