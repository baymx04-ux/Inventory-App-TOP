const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

const notFound = (res) =>
  res.status(404).render("error", { title: "Not found", message: "Category not found." });

exports.validate = [
  body("name").trim().notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer."),
  body("description").trim(),
];

exports.index = async (req, res) => {
  const categories = await db.getAllCategories();
  res.render("index", { title: "Categories", categories });
};

exports.detail = async (req, res) => {
  const category = await db.getCategory(req.params.id);
  if (!category) return notFound(res);
  const items = await db.getItemsByCategory(category.id);
  res.render("categories/detail", { title: category.name, category, items });
};

exports.newForm = (req, res) => {
  res.render("categories/form", {
    title: "New category",
    category: {},
    action: "/categories",
    isEdit: false,
  });
};

exports.create = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).render("categories/form", {
      title: "New category",
      category: req.body,
      action: "/categories",
      isEdit: false,
      errors: errors.array(),
    });
  }
  try {
    const { id } = await db.createCategory(req.body);
    res.redirect(`/categories/${id}`);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).render("categories/form", {
        title: "New category",
        category: req.body,
        action: "/categories",
        isEdit: false,
        errors: [{ msg: "A category with that name already exists." }],
      });
    }
    throw err;
  }
};

exports.editForm = async (req, res) => {
  const category = await db.getCategory(req.params.id);
  if (!category) return notFound(res);
  res.render("categories/form", {
    title: `Edit ${category.name}`,
    category,
    action: `/categories/${category.id}/update`,
    isEdit: true,
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const renderForm = (errors) =>
    res.status(400).render("categories/form", {
      title: "Edit category",
      category: { ...req.body, id },
      action: `/categories/${id}/update`,
      isEdit: true,
      errors,
    });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return renderForm(errors.array());

  if (!(await db.getCategory(id))) return notFound(res);
  try {
    await db.updateCategory(id, req.body);
    res.redirect(`/categories/${id}`);
  } catch (err) {
    if (err.code === "23505") return renderForm([{ msg: "A category with that name already exists." }]);
    throw err;
  }
};

exports.remove = async (req, res) => {
  const id = req.params.id;
  const category = await db.getCategory(id);
  if (!category) return notFound(res);
  try {
    await db.deleteCategory(id);
    res.redirect("/");
  } catch (err) {
    // 23503 = foreign key violation: the category still has items (ON DELETE RESTRICT).
    if (err.code === "23503") {
      const items = await db.getItemsByCategory(id);
      return res.status(409).render("categories/detail", {
        title: category.name,
        category,
        items,
        errors: [{ msg: "This category still has items. Move or delete its items first." }],
      });
    }
    throw err;
  }
};
