import dotenv from "dotenv";
import { createApp } from "./app.js";
import { connectDatabase } from "./config/db.js";
import { connectMySQL } from "./config/mysql.js";

dotenv.config();

const jwtSecret = process.env.JWT_SECRET || "development-secret";
const mongoUri = process.env.MONGODB_URI;

// Initialize the app
const { app } = createApp(jwtSecret);

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    // 1. Check for database configurations
    if (!mongoUri) {
      console.warn("MONGODB_URI is not defined. Legacy features may fail.");
    }
    
    if (!process.env.DB_HOST) {
       console.warn("MySQL DB_HOST is not defined. Authentication will fail.");
    }

    // 2. Ensure database connections
    // We run them in parallel to speed up cold starts
    const dbPromises = [];
    if (mongoUri) dbPromises.push(connectDatabase(mongoUri));
    dbPromises.push(connectMySQL());
    
    await Promise.all(dbPromises);

    // 3. Delegate to the express app
    return app(req, res);
  } catch (error) {
    console.error("API Handler Error:", error);
    return res.status(500).json({ error: "Internal Server Error during initialization" });
  }
}
