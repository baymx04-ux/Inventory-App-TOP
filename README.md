# Sound Stock: Inventory Application

Inventory manager for an imaginary music instrument store. Built with Express 5, EJS and PostgreSQL for The Odin Project.

## Data model

- `categories` (id, name UNIQUE, description)
- `brands` (id, name UNIQUE, country)
- `items` (id, name, description, price >= 0, quantity >= 0, category_id, brand_id)

Relations: a category has many items (`ON DELETE RESTRICT`), a brand has many items (`ON DELETE SET NULL`).

## Delete behavior

| Delete | Result |
|---|---|
| Category with items | Blocked, shows "move or delete its items first" |
| Empty category | Deleted |
| Brand | Deleted, its items become "Unbranded" |
| Item | Deleted |

Updates and deletes require the admin password (`ADMIN_PASSWORD`). Creating and reading are open.

## Run locally

1. Create a database: `createdb inventory`
2. `cp .env.example .env` and edit `DATABASE_URL` and `ADMIN_PASSWORD`
3. `npm install`
4. `npm run seed` (creates tables and inserts dummy data; it empties the tables first)
5. `npm run dev` then open http://localhost:3000

## Deploy

1. Create a Postgres database on Neon, Supabase or Railway and copy its connection string.
2. Seed it from your machine: `node db/populatedb.js "<connection-string>"`
3. Create a web service on Render or Railway from your GitHub repo:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL`, `ADMIN_PASSWORD` (the port is provided by the host)

## Notes

- All SQL is parameterized. EJS escapes output, so input is stored as typed and not double-escaped.
- Never commit `.env`.
