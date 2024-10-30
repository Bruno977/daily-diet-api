import { Knex } from "knex";
import { userType } from "./user";

declare module "knex/types/tables" {
  interface meal {
    id: string;
    user_id: string;
    name: string;
    description?: string;
    within_diet: boolean;
    meal_time: string;
    created_at: string;
    updated_at: string;
  }

  export interface Tables {
    users: userType;
    meals: meal;
  }
}
