import { build } from "./app";

const server = build(
  {
    logger: true,
  },
  { connectionString: "postgres://cook:michelin@localhost:5432/recipes" }
);

server.listen(3001, (err, address) => {
  if (err) {
    server.log.error(err);
    process.exit(1);
  }
});
