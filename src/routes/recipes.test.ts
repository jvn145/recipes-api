import { setupTestEnvironment } from "../helper";
import { RecipeType } from "../interfaces";

const app = setupTestEnvironment();

/** insert a potato into the db */
const addDummyRecipe = async (): Promise<number> => {
  const client = await app.pg.connect();
  const { rows } = await client.query(
    "INSERT INTO recipes (recipe_name) VALUES ('Mashed Potato') RETURNING recipe_id"
  );
  const id = rows[0].recipe_id;
  client.release();
  return id;
};

let id: RecipeType["recipe_id"];
beforeEach(async () => {
  // have a potato in db for use during tests
  id = await addDummyRecipe();
});

test("should return a list of recipes", async () => {
  // check if the potato is returned
  const res = await app.inject({ url: "/recipes" });
  expect(res.statusCode).toEqual(200);
  expect(res.json()[0]).toEqual({
    recipe_id: id,
    recipe_name: "Mashed Potato",
  });
});

test("should create a recipe", async () => {
  const recipePayload: RecipeType = {
    recipe_name: "Potato Gratin",
  };

  const res = await app.inject({
    url: "/recipes",
    method: "POST",
    payload: recipePayload,
  });
  expect(res.statusCode).toEqual(201);
});

test("should not create an invalid recipe", async () => {
  const recipePayload = {
    invalid_field: "Potato Gratin",
  };

  const res = await app.inject({
    url: "/recipes",
    method: "POST",
    payload: recipePayload,
  });
  expect(res.statusCode).toEqual(400);
});

test("should read a recipe", async () => {
  const res = await app.inject({
    url: `/recipes/${id}`,
    method: "GET",
  });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ recipe_name: "Mashed Potato", recipe_id: id });
});

test("should fail to read a missing recipe", async () => {
  const res = await app.inject({
    url: `/recipes/2`,
    method: "GET",
  });
  expect(res.statusCode).toEqual(404);
});

test("should update a recipe", async () => {
  const recipePayload: RecipeType = {
    recipe_name: "Taters in a Stew",
  };

  const res = await app.inject({
    url: `/recipes/${id}`,
    method: "PATCH",
    payload: recipePayload,
  });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ recipe_name: "Taters in a Stew", recipe_id: id });
});

test("should fail to update a missing recipe", async () => {
  const recipePayload: RecipeType = {
    recipe_name: "Taters in a Stew",
  };

  const res = await app.inject({
    url: `/recipes/2`,
    method: "PATCH",
    payload: recipePayload,
  });
  expect(res.statusCode).toEqual(404);
});

test("should delete a recipe", async () => {
  const res = await app.inject({
    url: `/recipes/${id}`,
    method: "DELETE",
  });
  expect(res.statusCode).toEqual(204);
});

test("should fail to delete a missing recipe", async () => {
  const res = await app.inject({
    url: `/recipes/2`,
    method: "DELETE",
  });
  expect(res.statusCode).toEqual(404);
});
