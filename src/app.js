const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ✅ Parse JSON
app.use(express.json());

// ✅ CORS (Vercel + Local)
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

// allow Vercel preview urls too (task-manager-sand-three-xxx.vercel.app)
function isAllowedOrigin(origin) {
  if (!origin) return true; // Postman/server-to-server
  if (ALLOWED_ORIGINS.includes(origin)) return true;

  // ✅ allow preview deployments (optional)
  if (
    origin.startsWith("https://task-manager-sand-three") &&
    origin.endsWith(".vercel.app")
  ) {
    return true;
  }
  return false;
}

const corsOptions = {
  origin: (origin, cb) => cb(null, isAllowedOrigin(origin)),
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Preflight fix for Express v5
app.options(/.*/, cors(corsOptions));

// ✅ Health
app.get("/health", (req, res) => res.json({ ok: true }));
app.get("/api/health", (req, res) => {
  res.json({
    ok: true,
    hasMongo: !!process.env.MONGO_URI,
    hasJwt: !!process.env.JWT_SECRET,
    allowedOrigins: ALLOWED_ORIGINS,
    time: new Date().toISOString(),
  });
});

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

// ✅ Global error handler (Vercel logs me error show hoga)
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err);
  res.status(500).json({ message: err.message || "Internal Server Error" });
});

module.exports = app;
