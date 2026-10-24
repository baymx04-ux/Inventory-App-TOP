const crypto = require("crypto");

// Protects update and delete actions with a shared admin password.
// Fails closed: if ADMIN_PASSWORD is not configured, nothing passes.
function safeEqual(a, b) {
  const hashA = crypto.createHash("sha256").update(String(a)).digest();
  const hashB = crypto.createHash("sha256").update(String(b)).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

module.exports = function adminAuth(req, res, next) {
  const expected = process.env.ADMIN_PASSWORD;
  const supplied = (req.body && req.body.adminPassword) || "";

  if (!expected || !safeEqual(supplied, expected)) {
    return res.status(403).render("error", {
      title: "Not allowed",
      message: "Wrong admin password. The action was not performed.",
    });
  }
  next();
};
