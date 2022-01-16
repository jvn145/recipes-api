import { setupTestEnvironment } from "../helper";
import { IngredientType } from "../interfaces";

const app = setupTestEnvironment();

/** insert a potato into the db */
const addDummyPotato = async (): Promise<number> => {
  const client = await app.pg.connect();
  const { rows } = await client.query(
    "INSERT INTO ingredients (ingredient_name) VALUES ('Potato') RETURNING ingredient_id"
  );
  const id = rows[0].ingredient_id;
  client.release();
  return id;
};

let id: IngredientType["ingredient_id"];
beforeEach(async () => {
  // have a potato in db for use during tests
  id = await addDummyPotato();
});

test("should return a list of ingredients", async () => {
  // check if the potato is returned
  const res = await app.inject({ url: "/ingredients" });
  expect(res.statusCode).toEqual(200);
  expect(res.json()[0]).toEqual({
    ingredient_id: id,
    ingredient_name: "Potato",
  });
});

test("should create an ingredient", async () => {
  const ingredientPayload: IngredientType = {
    ingredient_name: "Potato",
  };

  const res = await app.inject({
    url: "/ingredients",
    method: "POST",
    payload: ingredientPayload,
  });
  expect(res.statusCode).toEqual(201);
});

test("should not create invalid ingredient", async () => {
  const ingredientPayload = {
    name: "Potato",
  };

  const res = await app.inject({
    url: "/ingredients",
    method: "POST",
    payload: ingredientPayload,
  });
  expect(res.statusCode).toEqual(400);

})

test("should read an ingredient", async () => {
  const res = await app.inject({
    url: `/ingredients/${id}`,
    method: "GET",
  });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ ingredient_name: "Potato", ingredient_id: id });
});

test("should fail to read a missing ingredient", async () => {
  const res = await app.inject({
    url: `/ingredients/2`,
    method: "GET",
  });
  expect(res.statusCode).toEqual(404);
});

test("should update an ingredient", async () => {
  const ingredientPayload: IngredientType = {
    ingredient_name: "Taters",
  };

  const res = await app.inject({
    url: `/ingredients/${id}`,
    method: "PATCH",
    payload: ingredientPayload,
  });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ ingredient_name: "Taters", ingredient_id: id });
});

test("should fail to update a missing ingredient", async () => {
  const ingredientPayload: IngredientType = {
    ingredient_name: "Taters",
  };

  const res = await app.inject({
    url: `/ingredients/2`,
    method: "PATCH",
    payload: ingredientPayload,
  });
  expect(res.statusCode).toEqual(404);
});

test("should delete an ingredient", async () => {
  const res = await app.inject({
    url: `/ingredients/${id}`,
    method: "DELETE",
  });
  expect(res.statusCode).toEqual(204);
});

test("should fail to delete a missing ingredient", async () => {
  const res = await app.inject({
    url: `/ingredients/2`,
    method: "DELETE",
  });
  expect(res.statusCode).toEqual(404);
});
