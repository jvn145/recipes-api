import { setupTestEnvironment } from "../helper";

const app = setupTestEnvironment();

test("return root", async () => {
  const res = await app.inject({ url: "/" });
  expect(res.statusCode).toEqual(200);
  expect(res.json()).toEqual({ root: true });
});
