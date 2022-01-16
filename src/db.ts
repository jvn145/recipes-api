// FIXME: this will eventually break :D
const pg = require("pg");
pg.types.setTypeParser(20, Number);

export default pg;
