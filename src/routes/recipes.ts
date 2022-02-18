import { FastifyInstance, FastifyPluginAsync } from "fastify";

import { Recipe, RecipeType, RecipeList, RecipeListType } from "../interfaces";

interface RecipeParams {
  id: RecipeType["recipe_id"];
}

const indexRecipes = async (
  fastify: FastifyInstance
): Promise<RecipeListType> => {
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query("SELECT * FROM recipes");
    return rows;
  } finally {
    client.release();
  }
};

const createRecipe = async (
  fastify: FastifyInstance,
  recipe: RecipeType
): Promise<RecipeType["recipe_id"]> => {
  const client = await fastify.pg.connect();
  let id: RecipeType["recipe_id"];
  try {
    const { rows } = await client.query(
      "INSERT INTO recipes (recipe_name) VALUES($1) RETURNING recipe_id",
      [recipe.recipe_name]
    );
    id = rows[0].recipe_id;
  } finally {
    client.release();
  }
  return id;
};

const readRecipe = async (
  fastify: FastifyInstance,
  recipe_id: RecipeType["recipe_id"]
): Promise<RecipeType> => {
  const client = await fastify.pg.connect();
  let recipe: RecipeType;
  try {
    const { rows } = await client.query(
      "SELECT * FROM recipes WHERE recipe_id = $1",
      [recipe_id]
    );
    if (rows.length == 0) throw new Error("No matching recipe found");
    recipe = rows[0];
  } finally {
    client.release();
  }
  return recipe;
};

const updateRecipe = async (
  fastify: FastifyInstance,
  recipe_id: RecipeType["recipe_id"],
  updatePayload: RecipeType
): Promise<RecipeType> => {
  const client = await fastify.pg.connect();
  let recipe: RecipeType;
  try {
    const { rows } = await client.query(
      "UPDATE recipes SET recipe_name = $1 WHERE recipe_id = $2 RETURNING *",
      [updatePayload.recipe_name, recipe_id]
    );
    if (rows.length == 0) throw new Error("No matching recipe found");
    recipe = rows[0];
  } finally {
    client.release();
  }
  return recipe;
};

const deleteRecipe = async (
  fastify: FastifyInstance,
  recipe_id: RecipeType["recipe_id"]
): Promise<void> => {
  const client = await fastify.pg.connect();
  try {
    const { rows } = await client.query(
      "DELETE FROM recipes WHERE recipe_id = $1 RETURNING *",
      [recipe_id]
    );
    if (rows.length == 0) throw new Error("No matching recipe found");
  } finally {
    client.release();
  }
};

const recipes: FastifyPluginAsync = async (fastify): Promise<void> => {
  // INDEX
  fastify.route({
    method: "GET",
    url: "/",
    schema: {
      response: {
        200: RecipeList,
      },
    },
    handler: async function () {
      return await indexRecipes(fastify);
    },
  });

  // CREATE
  fastify.route<{ Body: RecipeType }>({
    method: "POST",
    url: "/",
    schema: {
      body: Recipe,
      response: {
        201: Recipe.properties.recipe_id,
      },
    },
    handler: async (request, reply) => {
      try {
        const id = await createRecipe(fastify, request.body);
        reply.status(201).send({ id });
      } catch (err) {
        reply.status(400).send({ error: true });
      }
      return reply;
    },
  });

  // READ
  fastify.route<{ Params: RecipeParams }>({
    method: "GET",
    url: "/:id",
    schema: {
      response: {
        200: Recipe,
      },
    },
    handler: async (request, reply) => {
      try {
        return await readRecipe(fastify, request.params.id);
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });

  // UPDATE
  fastify.route<{ Params: RecipeParams; Body: RecipeType }>({
    method: "PATCH",
    url: "/:id",
    schema: {
      body: Recipe,
      response: {
        200: Recipe,
      },
    },
    handler: async (request, reply) => {
      try {
        return await updateRecipe(fastify, request.params.id, request.body);
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });

  // DELETE
  fastify.route<{ Params: RecipeParams }>({
    method: "DELETE",
    url: "/:id",
    handler: async (request, reply) => {
      try {
        await deleteRecipe(fastify, request.params.id);
        return reply.status(204).send();
      } catch (err) {
        return reply.status(404).send({ error: true });
      }
    },
  });
};

export default recipes;
