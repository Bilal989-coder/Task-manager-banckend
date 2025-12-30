const app = require("../src/app");
const connectDB = require("../src/config/db");

module.exports = async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    return app(req, res);
  } catch (err) {
    console.error("❌ Vercel handler error:", err);
    return res.status(500).json({ message: err.message || "Server crashed" });
  }
};
