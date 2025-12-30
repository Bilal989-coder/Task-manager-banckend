const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const { listUsers } = require("../controllers/userController");

router.get("/", auth, requireRole("admin"), listUsers);

module.exports = router;
