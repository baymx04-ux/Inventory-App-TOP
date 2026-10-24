const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

const notFound = (res) =>
  res.status(404).render("error", { title: "Not found", message: "Item not found." });

exports.validate = [
  body("name").trim().notEmpty().withMessage("Name is required.")
    .isLength({ max: 150 }).withMessage("Name must be 150 characters or fewer."),
  body("description").trim(),
  body("price").trim()
    .isFloat({ min: 0, max: 99999999.99 }).withMessage("Price must be a number between 0 and 99,999,999.99."),
  body("quantity").trim()
    .isInt({ min: 0, max: 2000000000 }).withMessage("Quantity must be a whole number, 0 or more."),
  body("category_id").isInt({ min: 1 }).withMessage("Choose a category.")
    .bail()
    .custom(async (value) => {
      if (!(await db.getCategory(value))) throw new Error("That category does not exist.");
      return true;
    }),
  body("brand_id").optional({ values: "falsy" })
    .isInt({ min: 1 }).withMessage("Invalid brand.")
    .bail()
    .custom(async (value) => {
      if (!(await db.getBrand(value))) throw new Error("That brand does not exist.");
      return true;
    }),
];

async function renderForm(res, { status = 200, title, item, action, isEdit, errors = [] }) {
  const [categories, brands] = await Promise.all([db.getAllCategories(), db.getAllBrands()]);
  res.status(status).render("items/form", { title, item, action, isEdit, errors, categories, brands });
}

exports.detail = async (req, res) => {
  const item = await db.getItem(req.params.id);
  if (!item) return notFound(res);
  res.render("items/detail", { title: item.name, item });
};

exports.newForm = async (req, res) => {
  // Allow /items/new?category=3 to preselect a category.
  const item = { quantity: 0, category_id: req.query.category || "", brand_id: req.query.brand || "" };
  await renderForm(res, { title: "New item", item, action: "/items", isEdit: false });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return renderForm(res, {
      status: 400, title: "New item", item: req.body, action: "/items", isEdit: false, errors: errors.array(),
    });
  }
  const { id } = await db.createItem(req.body);
  res.redirect(`/items/${id}`);
};

exports.editForm = async (req, res) => {
  const item = await db.getItem(req.params.id);
  if (!item) return notFound(res);
  await renderForm(res, {
    title: `Edit ${item.name}`, item, action: `/items/${item.id}/update`, isEdit: true,
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return renderForm(res, {
      status: 400, title: "Edit item", item: { ...req.body, id },
      action: `/items/${id}/update`, isEdit: true, errors: errors.array(),
    });
  }
  if (!(await db.getItem(id))) return notFound(res);
  await db.updateItem(id, req.body);
  res.redirect(`/items/${id}`);
};

exports.remove = async (req, res) => {
  const item = await db.getItem(req.params.id);
  if (!item) return notFound(res);
  await db.deleteItem(item.id);
  res.redirect(`/categories/${item.category_id}`);
};
