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

// ✅ CORS MUST be before routes
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://task-manager-sand-three.vercel.app",
];

app.use(
  cors({
    origin: function (origin, cb) {
      // allow server-to-server or Postman (no origin)
      if (!origin) return cb(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ handle preflight
app.options("*", cors());

app.use(express.json());

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

module.exports = app;
