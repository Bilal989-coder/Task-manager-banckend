require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// ✅ cache connection for serverless
let cached = global.__mongoose_conn__;
if (!cached) cached = global.__mongoose_conn__ = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    if (!process.env.MONGO_URI) throw new Error("MONGO_URI is missing");
    cached.promise = mongoose.connect(process.env.MONGO_URI).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

// ✅ Connect once (works for Vercel + local)
connectDB()
  .then(() => {
    console.log("✅ MongoDB connected");
    // ✅ local dev only
    if (process.env.VERCEL !== "1") {
      app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
    }
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });

module.exports = app;
