import { build } from "./app";

export function setupTestEnvironment() {
  const connectionString =
    "postgres://cook:michelin@localhost:5432/recipes_test";

  const app = build({}, { connectionString });

  /** delete all rows in the database */
  const resetDB = async () => {
    const client = await app.pg.connect();
    await client.query("DELETE FROM ingredients");
    await client.query("DELETE FROM recipes");
    await client.query("ALTER SEQUENCE recipes_recipe_id_seq RESTART WITH 1;");
    await client.query(
      "ALTER SEQUENCE ingredients_ingredient_id_seq RESTART WITH 1;"
    );
    client.release();
  };

  beforeAll(async () => {
    await app.ready();
    await resetDB();
  });

  beforeEach(async () => {
    await resetDB();
  });

  afterEach(async () => {
    await resetDB();
  });

  afterAll(async () => {
    await resetDB();
    await app.close();
  });
  return app;
}
