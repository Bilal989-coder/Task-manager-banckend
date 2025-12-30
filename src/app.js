const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

const DEFAULT_ALLOWED = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://task-manager-sand-three.vercel.app",
];

const ENV_ALLOWED = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = ENV_ALLOWED.length ? ENV_ALLOWED : DEFAULT_ALLOWED;

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true); // Postman / server-to-server
    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ IMPORTANT: Express/router crash fix for "*" (use regex)
app.options(/.*/, cors(corsOptions));

app.use(express.json());

// ✅ health
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasMongo: !!process.env.MONGO_URI,
    hasJwt: !!process.env.JWT_SECRET,
    allowedOrigins: ALLOWED_ORIGINS,
    time: new Date().toISOString(),
  });
});

// ✅ routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

module.exports = app;
