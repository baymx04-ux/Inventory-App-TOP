// Used with router.param("id", validId). Rejects non-numeric ids before they reach Postgres.
module.exports = function validId(req, res, next, id) {
  if (!/^\d{1,9}$/.test(id)) {
    return res.status(404).render("error", { title: "Not found", message: "That page does not exist." });
  }
  next();
};
