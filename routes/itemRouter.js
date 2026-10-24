const { Router } = require("express");
const controller = require("../controllers/itemController");
const adminAuth = require("../middleware/adminAuth");
const validId = require("../middleware/validId");

const router = Router();
router.param("id", validId);

router.get("/new", controller.newForm);
router.post("/", controller.validate, controller.create);
router.get("/:id", controller.detail);
router.get("/:id/edit", controller.editForm);
router.post("/:id/update", adminAuth, controller.validate, controller.update);
router.post("/:id/delete", adminAuth, controller.remove);

module.exports = router;
