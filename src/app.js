const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");

const app = express();

// ✅ CORS (same config for app.use + app.options)
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://task-manager-sand-three.vercel.app",
];

const corsOptions = {
  origin: function (origin, cb) {
    // allow Postman / server-to-server (no origin)
    if (!origin) return cb(null, true);

    if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);

    // disallowed origin
    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // ✅ IMPORTANT: same options

app.use(express.json());

// ✅ health check (debug env quickly)
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

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req, res) => res.json({ ok: true, message: "API running" }));

module.exports = app;
