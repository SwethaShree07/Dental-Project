import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { connectMySQL } from "./config/mysql.js";

dotenv.config();

const port = Number(process.env.PORT || 5000);
const mongoUri = process.env.MONGODB_URI;
const jwtSecret = process.env.JWT_SECRET || "development-secret";

if (!mongoUri) {
  throw new Error("MONGODB_URI is missing");
}

// Connect to Databases
async function startServer() {
  // MongoDB (legacy models)
  try {
    await connectDatabase(mongoUri!);
  } catch (error) {
    console.error("CRITICAL: Failed to connect to MongoDB. Legacy features will be unavailable.");
  }

  // MySQL (New centralized auth)
  try {
    await connectMySQL();
  } catch (error) {
    console.error("CRITICAL: Failed to connect to MySQL. Authentication will be unavailable.");
    console.error("Check your DB_USER, DB_PASSWORD, and DB_HOST in backend/.env");
  }

  const { httpServer } = createApp(jwtSecret);

  httpServer.listen(port, () => {
    console.log(`Backend running on http://localhost:${port}`);
    console.log(`Health check: http://localhost:${port}/api/health`);
  });
}

startServer();
