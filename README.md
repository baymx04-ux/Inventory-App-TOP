# Sound Stock: Inventory Management Application

A full-stack inventory management app for a fictional music instrument store. Users can browse instruments by category and brand, and create, read, update, and delete categories, brands, and items. Protected actions (update and delete) require an admin password.

Built as a project in the **Node.js path** of [The Odin Project](https://www.theodinproject.com/), part of the **Node.js Certification**. See the original [assignment](https://www.theodinproject.com/lessons/node-path-nodejs-inventory-application).

**Live demo:** _add your deployed URL here_

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Database Design](#database-design)
- [Delete Behavior](#delete-behavior)
- [Routes](#routes)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [Security Notes](#security-notes)
- [Assignment Checklist](#assignment-checklist)
- [Author](#author)

## Features

- Browse categories on the home page and view every item in a category
- Full CRUD for **categories**, **brands**, and **items**
- Relational data model with foreign keys, unique constraints, and check constraints
- Server-side validation with clear error messages and form values preserved on failure
- Admin password protection for update and delete actions
- Safe delete rules: categories with items cannot be removed, brands can be removed without losing items
- Seed script to populate local and hosted databases with dummy data
- Responsive, hand-written CSS with no framework

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Server framework | Express 5 |
| Templating | EJS |
| Database | PostgreSQL |
| Database client | node-postgres (`pg`) |
| Validation | express-validator |
| Configuration | dotenv |

## Database Design

```mermaid
erDiagram
    CATEGORIES ||--o{ ITEMS : contains
    BRANDS ||--o{ ITEMS : makes

    CATEGORIES {
        int id PK
        varchar name UK
        text description
    }
    BRANDS {
        int id PK
        varchar name UK
        varchar country
    }
    ITEMS {
        int id PK
        varchar name
        text description
        numeric price
        int quantity
        int category_id FK
        int brand_id FK
    }
```

- A category has many items. Every item belongs to exactly one category.
- A brand has many items. An item may have no brand.
- `price` and `quantity` have `CHECK (>= 0)` constraints.
- Category and brand names are unique.

The full schema is in [`db/schema.sql`](db/schema.sql).

## Delete Behavior

| Action | Result |
|---|---|
| Delete a category that has items | Blocked (`ON DELETE RESTRICT`). The user is told to move or delete the items first. |
| Delete an empty category | Deleted |
| Delete a brand | Deleted. Its items are kept and shown as "Unbranded" (`ON DELETE SET NULL`). |
| Delete an item | Deleted |

## Routes

The same pattern applies to categories (`/categories`), brands (`/brands`), and items (`/items`).

| Method | Path | Purpose | Admin password |
|---|---|---|---|
| GET | `/` | Home page, list categories | No |
| GET | `/<resource>/new` | Create form | No |
| POST | `/<resource>` | Create | No |
| GET | `/<resource>/:id` | View details | No |
| GET | `/<resource>/:id/edit` | Edit form | No |
| POST | `/<resource>/:id/update` | Update | Yes |
| POST | `/<resource>/:id/delete` | Delete | Yes |
| GET | `/brands` | List brands | No |

## Project Structure

```
inventory-app/
  app.js                     Express setup and routing
  db/
    pool.js                  PostgreSQL connection pool
    queries.js               All SQL queries
    schema.sql               Table definitions
    populatedb.js            Seed script
  routes/                    Route definitions
  controllers/               Request handlers and validation
  middleware/
    adminAuth.js             Admin password check
    validId.js               Rejects non-numeric ids
  views/                     EJS templates and partials
  public/styles.css          Styling
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18 or newer
- [PostgreSQL](https://www.postgresql.org/) running locally

### Installation

1. Clone the repository and install dependencies:

   ```bash
   git clone <your-repo-url>
   cd <your-repo-folder>
   npm install
   ```

2. Create the database:

   ```bash
   createdb inventory
   ```

   On macOS with Homebrew, start PostgreSQL first with `brew services start postgresql@<version>`. The default superuser is your Mac username, so no `-U postgres` is needed.

3. Create your environment file:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env`:

   ```
   DATABASE_URL=postgresql://localhost:5432/inventory
   ADMIN_PASSWORD=choose-a-password
   PORT=3000
   ```

   If your PostgreSQL user has a password, use `postgresql://USER:PASSWORD@localhost:5432/inventory`.

4. Create the tables and add dummy data:

   ```bash
   npm run seed
   ```

   This empties the tables before inserting, so running it again resets the data.

5. Start the app:

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
|---|---|
| `npm start` | Start the server |
| `npm run dev` | Start with auto-restart on file changes |
| `npm run seed` | Create tables and insert dummy data |

## Deployment

1. Create a hosted PostgreSQL database (for example on [Neon](https://neon.tech) or [Supabase](https://supabase.com)) and copy its connection string.
2. Seed the hosted database from your machine:

   ```bash
   node db/populatedb.js "<connection-string>"
   ```

3. Create a web service on a host such as [Render](https://render.com) or [Railway](https://railway.app) from this repository:
   - Build command: `npm install`
   - Start command: `npm start`
   - Environment variables: `DATABASE_URL` and `ADMIN_PASSWORD`

## Security Notes

- All SQL uses parameterized queries to prevent SQL injection.
- EJS escapes output by default to prevent cross-site scripting.
- The admin password is read from an environment variable and compared in constant time. If it is not set, protected actions are refused.
- Secrets are kept in `.env`, which is excluded from version control.
- This password gate is a simple protection for the assignment. A real application should use proper user accounts and authentication.

## Assignment Checklist

- [x] Express project with a PostgreSQL database
- [x] Planned tables, fields, and relations
- [x] Routes and controllers
- [x] Read views for categories, brands, and items
- [x] Create and update forms with validation
- [x] Delete behavior designed and handled
- [x] Seed script for dummy data
- [x] Admin password for destructive actions (extra credit)
- [x] Styling (extra credit)
- [ ] Deployed (add your live link above)

## Author

**Kanwar Junaid Islam**

- GitHub: [baymx04-ux](https://github.com/baymx04-ux)
- LinkedIn: [junaid-kanwar](https://linkedin.com/in/junaid-kanwar-0725b6315)

## Acknowledgements

Project specification by [The Odin Project](https://www.theodinproject.com/).