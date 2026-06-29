import mongoose from "mongoose";

export const connectDB = async (): Promise<void> => {
  console.log("connectDB() called");

  try {
    const mongoURI = process.env.MONGODB_URI;

    console.log("MONGODB_URI exists:", !!mongoURI);

    await mongoose.connect(mongoURI!);

    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    throw error;
  }
};
