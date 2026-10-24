#!/usr/bin/env node
// Usage:
//   node db/populatedb.js                      (uses DATABASE_URL from .env)
//   node db/populatedb.js <connection-string>  (e.g. your hosted database)
// WARNING: this empties the tables before inserting the dummy data.
require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const url = process.argv[2] || process.env.DATABASE_URL;
if (!url) {
  console.error("Provide a connection string as an argument or set DATABASE_URL.");
  process.exit(1);
}

const isLocal = /localhost|127\.0\.0\.1/.test(url);

const categories = [
  ["Guitars", "Acoustic, electric and bass guitars."],
  ["Keyboards", "Digital pianos, synthesizers and workstations."],
  ["Drums & Percussion", "Drum kits, snares, cymbals and hand percussion."],
  ["Brass & Woodwind", "Trumpets, saxophones, flutes and clarinets."],
  ["Accessories", "Strings, picks, stands, cables and cases."],
];

const brands = [
  ["Fender", "United States"],
  ["Gibson", "United States"],
  ["Yamaha", "Japan"],
  ["Roland", "Japan"],
  ["Casio", "Japan"],
  ["Pearl", "Japan"],
  ["Ibanez", "Japan"],
  ["D'Addario", "United States"],
];

// [name, description, price, quantity, category, brand]
const items = [
  ["Stratocaster Player", "Classic double-cutaway electric guitar with three single-coil pickups.", 849.99, 6, "Guitars", "Fender"],
  ["Les Paul Standard", "Iconic solid-body electric with humbucker pickups.", 2499.0, 3, "Guitars", "Gibson"],
  ["FG800 Acoustic", "Solid spruce top dreadnought acoustic guitar.", 229.0, 10, "Guitars", "Yamaha"],
  ["RG421 Electric", "Fast neck and a versatile pickup setup for rock and metal.", 399.5, 5, "Guitars", "Ibanez"],
  ["P-171 Digital Piano", "88 weighted keys with a realistic piano sound.", 599.99, 4, "Keyboards", "Yamaha"],
  ["FP-30X Digital Piano", "Portable piano with Bluetooth and a powerful speaker system.", 749.0, 2, "Keyboards", "Roland"],
  ["Casiotone CT-S300", "Lightweight 61-key keyboard, great for beginners.", 129.99, 12, "Keyboards", "Casio"],
  ["Export 5-Piece Drum Kit", "Complete kit with hardware and cymbals.", 579.0, 3, "Drums & Percussion", "Pearl"],
  ["Roadshow Junior Kit", "Compact 3-piece kit for young drummers.", 299.0, 0, "Drums & Percussion", "Pearl"],
  ["YTR-2330 Trumpet", "Student trumpet with a gold brass bell.", 649.0, 5, "Brass & Woodwind", "Yamaha"],
  ["YAS-280 Alto Saxophone", "Easy-blowing alto sax for students.", 1299.0, 2, "Brass & Woodwind", "Yamaha"],
  ["EXL Electric Guitar Strings", "Nickel wound, light gauge (10-46).", 6.99, 120, "Accessories", "D'Addario"],
  ["Heavy Guitar Picks (12 pack)", "Celluloid picks in assorted colors.", 4.5, 80, "Accessories", "Fender"],
  ["Adjustable Keyboard Stand", "Double-braced X-style stand.", 39.0, 9, "Accessories", null],
];

async function main() {
  const client = new Client({
    connectionString: url,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  });
  await client.connect();
  try {
    await client.query("BEGIN");
    await client.query(fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8"));
    await client.query("TRUNCATE items, brands, categories RESTART IDENTITY CASCADE");

    const categoryIds = {};
    for (const [name, description] of categories) {
      const { rows } = await client.query(
        "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
        [name, description]
      );
      categoryIds[name] = rows[0].id;
    }

    const brandIds = {};
    for (const [name, country] of brands) {
      const { rows } = await client.query(
        "INSERT INTO brands (name, country) VALUES ($1, $2) RETURNING id",
        [name, country]
      );
      brandIds[name] = rows[0].id;
    }

    for (const [name, description, price, quantity, category, brand] of items) {
      await client.query(
        `INSERT INTO items (name, description, price, quantity, category_id, brand_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, description, price, quantity, categoryIds[category], brand ? brandIds[brand] : null]
      );
    }

    await client.query("COMMIT");
    console.log(`Seeded ${categories.length} categories, ${brands.length} brands, ${items.length} items.`);
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
