const app = require("../app");
const connectDB = require("../db");

module.exports = async (req, res) => {
  try {
    await connectDB(process.env.MONGO_URI);
    return app(req, res);
  } catch (err) {
    console.error("❌ Function error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};
