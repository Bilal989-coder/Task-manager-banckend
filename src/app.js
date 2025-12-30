const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ✅ Allowed origins (local + Vercel)
const DEFAULT_ALLOWED = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://task-manager-sand-three.vercel.app",
];

// ✅ Optional: env se origins (comma separated)
const ENV_ALLOWED = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const ALLOWED_ORIGINS = ENV_ALLOWED.length ? ENV_ALLOWED : DEFAULT_ALLOWED;

const corsOptions = {
  origin: function (origin, cb) {
    // allow Postman / server-to-server
    if (!origin) return cb(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

    // ❌ block others
    return cb(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

// ✅ CORS must be before routes
app.use(cors(corsOptions));

// ✅ IMPORTANT: Preflight handler (Express wildcard crash fix)
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.use(express.json());

// ✅ Health endpoints
app.get("/health", (req, res) => res.json({ ok: true }));

app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    env: {
      hasMongo: !!process.env.MONGO_URI,
      hasJwt: !!process.env.JWT_SECRET,
      nodeEnv: process.env.NODE_ENV,
    },
    allowedOrigins: ALLOWED_ORIGINS,
    time: new Date().toISOString(),
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

module.exports = app;
