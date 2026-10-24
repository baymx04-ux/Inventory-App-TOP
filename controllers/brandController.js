const { body, validationResult } = require("express-validator");
const db = require("../db/queries");

const notFound = (res) =>
  res.status(404).render("error", { title: "Not found", message: "Brand not found." });

exports.validate = [
  body("name").trim().notEmpty().withMessage("Name is required.")
    .isLength({ max: 100 }).withMessage("Name must be 100 characters or fewer."),
  body("country").trim().isLength({ max: 100 }).withMessage("Country must be 100 characters or fewer."),
];

exports.list = async (req, res) => {
  const brands = await db.getAllBrands();
  res.render("brands/list", { title: "Brands", brands });
};

exports.detail = async (req, res) => {
  const brand = await db.getBrand(req.params.id);
  if (!brand) return notFound(res);
  const items = await db.getItemsByBrand(brand.id);
  res.render("brands/detail", { title: brand.name, brand, items });
};

exports.newForm = (req, res) => {
  res.render("brands/form", { title: "New brand", brand: {}, action: "/brands", isEdit: false });
};

exports.create = async (req, res) => {
  const renderForm = (errors) =>
    res.status(400).render("brands/form", {
      title: "New brand",
      brand: req.body,
      action: "/brands",
      isEdit: false,
      errors,
    });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return renderForm(errors.array());
  try {
    const { id } = await db.createBrand(req.body);
    res.redirect(`/brands/${id}`);
  } catch (err) {
    if (err.code === "23505") return renderForm([{ msg: "A brand with that name already exists." }]);
    throw err;
  }
};

exports.editForm = async (req, res) => {
  const brand = await db.getBrand(req.params.id);
  if (!brand) return notFound(res);
  res.render("brands/form", {
    title: `Edit ${brand.name}`,
    brand,
    action: `/brands/${brand.id}/update`,
    isEdit: true,
  });
};

exports.update = async (req, res) => {
  const id = req.params.id;
  const renderForm = (errors) =>
    res.status(400).render("brands/form", {
      title: "Edit brand",
      brand: { ...req.body, id },
      action: `/brands/${id}/update`,
      isEdit: true,
      errors,
    });

  const errors = validationResult(req);
  if (!errors.isEmpty()) return renderForm(errors.array());

  if (!(await db.getBrand(id))) return notFound(res);
  try {
    await db.updateBrand(id, req.body);
    res.redirect(`/brands/${id}`);
  } catch (err) {
    if (err.code === "23505") return renderForm([{ msg: "A brand with that name already exists." }]);
    throw err;
  }
};

// Deleting a brand keeps its items; their brand_id becomes NULL (ON DELETE SET NULL).
exports.remove = async (req, res) => {
  if (!(await db.getBrand(req.params.id))) return notFound(res);
  await db.deleteBrand(req.params.id);
  res.redirect("/brands");
};
