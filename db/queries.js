const pool = require("./pool");

// ---------- Categories ----------
async function getAllCategories() {
  const { rows } = await pool.query(`
    SELECT c.*, COUNT(i.id)::int AS item_count
    FROM categories c
    LEFT JOIN items i ON i.category_id = c.id
    GROUP BY c.id
    ORDER BY c.name`);
  return rows;
}

async function getCategory(id) {
  const { rows } = await pool.query("SELECT * FROM categories WHERE id = $1", [id]);
  return rows[0];
}

async function createCategory({ name, description }) {
  const { rows } = await pool.query(
    "INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id",
    [name, description || null]
  );
  return rows[0];
}

async function updateCategory(id, { name, description }) {
  await pool.query("UPDATE categories SET name = $1, description = $2 WHERE id = $3", [
    name,
    description || null,
    id,
  ]);
}

async function deleteCategory(id) {
  await pool.query("DELETE FROM categories WHERE id = $1", [id]);
}

// ---------- Brands ----------
async function getAllBrands() {
  const { rows } = await pool.query(`
    SELECT b.*, COUNT(i.id)::int AS item_count
    FROM brands b
    LEFT JOIN items i ON i.brand_id = b.id
    GROUP BY b.id
    ORDER BY b.name`);
  return rows;
}

async function getBrand(id) {
  const { rows } = await pool.query("SELECT * FROM brands WHERE id = $1", [id]);
  return rows[0];
}

async function createBrand({ name, country }) {
  const { rows } = await pool.query(
    "INSERT INTO brands (name, country) VALUES ($1, $2) RETURNING id",
    [name, country || null]
  );
  return rows[0];
}

async function updateBrand(id, { name, country }) {
  await pool.query("UPDATE brands SET name = $1, country = $2 WHERE id = $3", [
    name,
    country || null,
    id,
  ]);
}

async function deleteBrand(id) {
  await pool.query("DELETE FROM brands WHERE id = $1", [id]);
}

// ---------- Items ----------
async function getItemsByCategory(categoryId) {
  const { rows } = await pool.query(
    `SELECT i.*, b.name AS brand_name
     FROM items i
     LEFT JOIN brands b ON b.id = i.brand_id
     WHERE i.category_id = $1
     ORDER BY i.name`,
    [categoryId]
  );
  return rows;
}

async function getItemsByBrand(brandId) {
  const { rows } = await pool.query(
    `SELECT i.*, c.name AS category_name
     FROM items i
     JOIN categories c ON c.id = i.category_id
     WHERE i.brand_id = $1
     ORDER BY i.name`,
    [brandId]
  );
  return rows;
}

async function getItem(id) {
  const { rows } = await pool.query(
    `SELECT i.*, c.name AS category_name, b.name AS brand_name
     FROM items i
     JOIN categories c ON c.id = i.category_id
     LEFT JOIN brands b ON b.id = i.brand_id
     WHERE i.id = $1`,
    [id]
  );
  return rows[0];
}

async function createItem({ name, description, price, quantity, category_id, brand_id }) {
  const { rows } = await pool.query(
    `INSERT INTO items (name, description, price, quantity, category_id, brand_id)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
    [name, description || null, price, quantity, category_id, brand_id || null]
  );
  return rows[0];
}

async function updateItem(id, { name, description, price, quantity, category_id, brand_id }) {
  await pool.query(
    `UPDATE items
     SET name = $1, description = $2, price = $3, quantity = $4, category_id = $5, brand_id = $6
     WHERE id = $7`,
    [name, description || null, price, quantity, category_id, brand_id || null, id]
  );
}

async function deleteItem(id) {
  await pool.query("DELETE FROM items WHERE id = $1", [id]);
}

module.exports = {
  getAllCategories, getCategory, createCategory, updateCategory, deleteCategory,
  getAllBrands, getBrand, createBrand, updateBrand, deleteBrand,
  getItemsByCategory, getItemsByBrand, getItem, createItem, updateItem, deleteItem,
};
