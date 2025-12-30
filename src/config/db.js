const mongoose = require("mongoose");

async function connectDB(mongoUri) {
  if (!mongoUri) {
    throw new Error("MONGO_URI is missing in environment variables");
  }

  mongoose.set("strictQuery", true);

  await mongoose.connect(mongoUri, {
    // options optional in modern mongoose, but safe:
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
  });

  return mongoose.connection;
}

module.exports = connectDB;
