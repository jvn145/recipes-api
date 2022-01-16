import { FastifyInstance, FastifyPluginAsync } from "fastify";

import {
  Ingredient,
  IngredientType,
  IngredientList,
  IngredientListType,
} from "../interfaces";

interface IngredientIdParams {
  id: IngredientType["ingredient_id"];
}

const indexIngredients = async (
  fastify: FastifyInstance
): Promise<IngredientListType> => {
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query("SELECT * FROM ingredients");
    return rows;
  } finally {
    client.release();
  }
};

const createIngredient = async (
  fastify: FastifyInstance,
  ingredient: IngredientType
): Promise<IngredientType["ingredient_id"]> => {
  const client = await fastify.pg.connect();
  let id: IngredientType["ingredient_id"];
  try {
    const { rows } = await client.query(
      "INSERT INTO ingredients (ingredient_name) VALUES($1) RETURNING ingredient_id",
      [ingredient.ingredient_name]
    );
    id = rows[0].ingredient_id;
  } finally {
    client.release();
  }
  return id;
};

const readIngredient = async (
  fastify: FastifyInstance,
  ingredient_id: IngredientType["ingredient_id"]
): Promise<IngredientType> => {
  const client = await fastify.pg.connect();
  let ingredient: IngredientType;
  try {
    const { rows } = await client.query(
      "SELECT * FROM ingredients WHERE ingredient_id = $1",
      [ingredient_id]
    );
    if (rows.length == 0) throw new Error("No matching ingredient found");
    ingredient = rows[0];
  } finally {
    client.release();
  }
  return ingredient;
};

const updateIngredient = async (
  fastify: FastifyInstance,
  ingredient_id: IngredientType["ingredient_id"],
  updatePayload: IngredientType
): Promise<IngredientType> => {
  const client = await fastify.pg.connect();
  let ingredient: IngredientType;
  try {
    const { rows } = await client.query(
      "UPDATE ingredients SET ingredient_name = $1 WHERE ingredient_id = $2 RETURNING *",
      [updatePayload.ingredient_name, ingredient_id]
    );
    if (rows.length == 0) throw new Error("No matching ingredient found");
    ingredient = rows[0];
  } finally {
    client.release();
  }
  return ingredient;
};

const deleteIngredient = async (
  fastify: FastifyInstance,
  ingredient_id: IngredientType["ingredient_id"]
): Promise<void> => {
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(
      "DELETE FROM ingredients WHERE ingredient_id = $1 RETURNING *",
      [ingredient_id]
    );
    if (rows.length == 0) throw new Error("No matching ingredient found");
  } finally {
    client.release();
  }
};

const ingredients: FastifyPluginAsync = async (
  fastify
): Promise<void> => {
  // INDEX
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        200: IngredientList,
      },
    },
    handler: async function () {
      return await indexIngredients(fastify);
    },
  });

  // CREATE
  fastify.route<{ Body: IngredientType }>({
    method: "POST",
    url: "/",
    schema: {
      body: Ingredient,
      response: {
        201: Ingredient.properties.ingredient_id,
      },
    },
    handler: async (request, reply) => {
      try {
        const id = await createIngredient(fastify, request.body);
        reply.status(201).send({ id });
      } catch (err) {
        reply.status(400).send({ error: true });
      }
      return reply;
    },
  });

  // READ
  fastify.route<{ Params: IngredientIdParams }>({
    method: "GET",
    url: "/:id",
    schema: {
      response: {
        200: Ingredient,
      },
    },
    handler: async (request, reply) => {
      try {
        return await readIngredient(fastify, request.params.id);
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });

  // UPDATE
  fastify.route<{ Params: IngredientIdParams; Body: IngredientType }>({
    method: "PATCH",
    url: "/:id",
    schema: {
      body: Ingredient,
      response: {
        200: Ingredient,
      },
    },
    handler: async (request, reply) => {
      try {
        return await updateIngredient(fastify, request.params.id, request.body);
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });

  // DELETE
  fastify.route<{ Params: IngredientIdParams }>({
    method: "DELETE",
    url: "/:id",
    handler: async (request, reply) => {
      try {
        await deleteIngredient(fastify, request.params.id);
        return reply.status(204).send();
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });
};

export default ingredients;
