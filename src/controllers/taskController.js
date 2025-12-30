const Task = require("../models/Task");

function toInt(v, def) {
  const n = parseInt(v, 10);
  return Number.isFinite(n) && n > 0 ? n : def;
}

function buildTaskFilter({ search, status, assignedTo, priority }) {
  const filter = {};

  if (status && status !== "All") filter.status = status;
  if (priority && priority !== "All") filter.priority = priority;

  if (assignedTo && assignedTo !== "All") filter.assignedTo = assignedTo;

  if (search && search.trim()) {
    const q = search.trim();
    // text index approach
    filter.$text = { $search: q };
  }

  return filter;
}

function countFilter(filter) {
  if (!filter.$text) return filter;
  const f = { ...filter };
  delete f.$text;
  return f;
}

// MANAGER: list all tasks with pagination/filters
exports.getAllTasks = async (req, res) => {
  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 10);
  const skip = (page - 1) * limit;

  const {
    search = "",
    status = "All",
    priority = "All",
    assignedTo = "All",
  } = req.query;

  const filter = buildTaskFilter({ search, status, priority, assignedTo });

  // Sort: text score first (if searching), then most recently updated
  const sort = filter.$text
    ? { score: { $meta: "textScore" }, updatedAt: -1 }
    : { updatedAt: -1 };

  const query = Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (filter.$text) query.select({ score: { $meta: "textScore" } });

  const [items, total] = await Promise.all([
    query,
    Task.countDocuments(countFilter(filter)),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));
  res.json({ items, page, limit, total, pages });
};

// MEMBER: my tasks (pagination + filters)
exports.getMyTasks = async (req, res) => {
  const page = toInt(req.query.page, 1);
  const limit = toInt(req.query.limit, 20);
  const skip = (page - 1) * limit;

  const {
    search = "",
    status = "All",
    priority = "All",
  } = req.query;

  const filter = buildTaskFilter({
    search,
    status,
    priority,
    assignedTo: req.user.id, 
  });

  const sort = filter.$text
    ? { score: { $meta: "textScore" }, updatedAt: -1 }
    : { updatedAt: -1 };

  const query = Task.find(filter)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  if (filter.$text) query.select({ score: { $meta: "textScore" } });

  const [items, total] = await Promise.all([
    query,
    Task.countDocuments(countFilter(filter)),
  ]);

  const pages = Math.max(1, Math.ceil(total / limit));
  res.json({ items, page, limit, total, pages });
};

// MANAGER: create task + audit fields
exports.createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, dueDate, priority } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      status: status || "Todo",
      priority: priority || "Medium",
      dueDate: dueDate || null,
      createdBy: req.user.id,
      updatedBy: req.user.id,
    });

    const populated = await Task.findById(task._id)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    return res.status(201).json(populated);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to create task" });
  }
};

// MANAGER: edit task + updatedBy
exports.updateTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status, dueDate, priority } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        ...(title !== undefined ? { title } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(assignedTo !== undefined ? { assignedTo } : {}),
        ...(status !== undefined ? { status } : {}),
        ...(priority !== undefined ? { priority } : {}),
        ...(dueDate !== undefined ? { dueDate } : {}),
        updatedBy: req.user.id,
      },
      { new: true, runValidators: true }
    )
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .populate("updatedBy", "name email role");

    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json(task);
  } catch (e) {
    return res.status(400).json({ message: e.message || "Failed to update task" });
  }
};

// MEMBER: update only status of own task + updatedBy
exports.updateStatus = async (req, res) => {
  const taskId = req.params.id;
  const { status } = req.body;

  if (!["Todo", "In Progress", "Done"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const task = await Task.findById(taskId);
  if (!task) return res.status(404).json({ message: "Task not found" });

  if (String(task.assignedTo) !== String(req.user.id)) {
    return res.status(403).json({ message: "Not allowed" });
  }

  task.status = status;
  task.updatedBy = req.user.id;
  await task.save();

  const populated = await Task.findById(task._id)
    .populate("assignedTo", "name email role")
    .populate("createdBy", "name email role")
    .populate("updatedBy", "name email role");

  res.json(populated);
};

// MANAGER: delete
exports.deleteTask = async (req, res) => {
  const taskId = req.params.id;
  const deleted = await Task.findByIdAndDelete(taskId);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.json({ ok: true });
};
