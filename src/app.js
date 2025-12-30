const express = require("express");
const cors = require("cors");

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: {
      hasMongo: !!process.env.MONGO_URI,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
    time: new Date().toISOString(),
  });
});

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

module.exports = app;
