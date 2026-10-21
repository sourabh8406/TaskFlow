import mongoose from "mongoose";
async function connectDB(url = process.env.MONGO_URI) {
  if (!url) {
    throw new Error("MongoDB connection URL is not provided.");
  }
  mongoose.set("strictQuery", true);

  try {
    await mongoose.connect(url);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  } catch (error) {
    console.error("Error connecting to MongoDB:", error.message);
    throw error;
  }
}

async function disconnectDB() {
  await mongoose.disconnect();
}

function isSbReady() {
  return mongoose.connection.readyState === 1;
}

module.exports = { connectDB, disconnectDB, isSbReady };
