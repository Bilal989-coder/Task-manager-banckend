const mongoose = require("mongoose");

let cached = global.__mongoose_cached;
if (!cached) cached = global.__mongoose_cached = { conn: null, promise: null };

async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI is missing");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose
      .connect(uri, { autoIndex: true })
      .then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

module.exports = connectDB;
