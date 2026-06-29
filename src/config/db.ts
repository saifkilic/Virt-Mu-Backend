import mongoose from "mongoose";

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log("connectDB() called");

    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is not defined");
    }

    console.log("MONGODB_URI exists:", true);

    await mongoose.connect(mongoURI);

    isConnected = true;

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
