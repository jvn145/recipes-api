import Fastify, { FastifyServerOptions } from "fastify";

import fastifyCors from "fastify-cors";
import fastifyPostgres from "fastify-postgres";

import db from "./db";

import ingredients from "./routes/ingredients";
import recipes from "./routes/recipes";

export interface DatabaseOptions {
  connectionString: String;
}

export const build = (
  fastifyOpts: FastifyServerOptions = {},
  dbOpts: DatabaseOptions
) => {
  const app = Fastify(fastifyOpts);
  app.register(fastifyCors, {
    origin: /localhost/,
  });
  app.register(fastifyPostgres, {
    ...dbOpts,
    pg: db,
  });
  app.register(ingredients, { prefix: "/ingredients" });
  app.register(recipes, { prefix: "/recipes" });
  return app;
};
