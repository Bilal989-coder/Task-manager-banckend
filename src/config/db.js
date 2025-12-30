const mongoose = require("mongoose");

let cached = global.__mongoose;
if (!cached) cached = global.__mongoose = { conn: null, promise: null };

async function connectDB(uri) {
  if (!uri) throw new Error("MONGO_URI missing");

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(uri, {
      // optional: dbName: process.env.MONGO_DB,
      autoIndex: true,
    });
  }

  cached.conn = await cached.promise;
  console.log("✅ MongoDB connected");
  return cached.conn;
}

module.exports = connectDB;
