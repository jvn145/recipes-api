import Fastify, { FastifyServerOptions } from "fastify";

import fastifyCors from "fastify-cors";

import ingredients from "./routes/ingredients";
import fastifyPostgres from "fastify-postgres";
import db from "./db";

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
  return app;
};
