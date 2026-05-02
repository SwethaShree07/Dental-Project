import mongoose from "mongoose";

export async function connectDatabase(uri: string) {
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000, 
    bufferCommands: false, // Don't buffer commands if not connected
  });
  console.log("MongoDB connected");
}
