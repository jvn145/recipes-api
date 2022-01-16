import { setupTestEnvironment, sleep } from "../helper";
import { IngredientType } from "../interfaces";

const app = setupTestEnvironment();

/** insert a potato into the db */
const addDummyPotato = async (): Promise<Number> => {
  const client = await app.pg.connect();
  const { rows } = await client.query(
    "INSERT INTO ingredients (ingredient_name) VALUES ('Potato') RETURNING ingredient_id"
  );
  const id = rows[0].ingredient_id;
  client.release();
  return id;
};

test("should return a list of ingredients", async () => {
  const id = await addDummyPotato();

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

test("should read an ingredient", async () => {
  const id = await addDummyPotato();

  const res = await app.inject({
    url: `/ingredients/${id}`,
    method: "GET",
  });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ ingredient_name: "Potato", ingredient_id: id });
});

test("should update an ingredient", async () => {
  const id = await addDummyPotato();

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

test("should delete an ingredient", async () => {
  const id = await addDummyPotato();

  const res = await app.inject({
    url: `/ingredients/${id}`,
    method: "DELETE",
  });
  expect(res.statusCode).toEqual(204);
});

test.todo("should delete ingredient");
