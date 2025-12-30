const User = require("../models/User");

// GET /api/users  (admin)
async function listUsers(req, res) {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.json(users);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

// POST /api/users (admin)
async function createUser(req, res) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "name, email, password required" });

    const exists = await User.findOne({ email: email.toLowerCase().trim() });
    if (exists) return res.status(409).json({ message: "Email already exists" });

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role: role === "admin" ? "admin" : "member",
      passwordHash: "temp",
    });

    await user.setPassword(password);
    await user.save();

    return res.status(201).json(user);
  } catch (e) {
    return res.status(500).json({ message: "Server error" });
  }
}

module.exports = { listUsers, createUser };
