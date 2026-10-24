require("dotenv").config();
const { Pool } = require("pg");

const url = process.env.DATABASE_URL;
const isLocal = !url || /localhost|127\.0\.0\.1/.test(url);

module.exports = new Pool({
  connectionString: url,
  // Hosted providers (Neon, Supabase, Railway) need SSL; local Postgres does not.
  ssl: isLocal ? false : { rejectUnauthorized: false },
});
