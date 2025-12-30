const router = require("express").Router();
const auth = require("../middleware/auth");
const requireRole = require("../middleware/requireRole");
const ctrl = require("../controllers/taskController");

// Manager
router.get("/", auth, requireRole("admin"), ctrl.getAllTasks);
router.post("/", auth, requireRole("admin"), ctrl.createTask);
router.put("/:id", auth, requireRole("admin"), ctrl.updateTask);
router.delete("/:id", auth, requireRole("admin"), ctrl.deleteTask);

// Member
router.get("/my", auth, ctrl.getMyTasks);
router.patch("/:id/status", auth, ctrl.updateStatus);

module.exports = router;
