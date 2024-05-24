const pg = require("pg");
const { Pool } = pg;

const db = new Pool({
  user: "postgres",
  port: 5432,
  host: "localhost",
  database: "react_auth2.0",
  password: "123",
});

module.exports = db;
