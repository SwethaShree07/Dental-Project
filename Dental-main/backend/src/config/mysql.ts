import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const dbName = process.env.DB_NAME || "alpha_dent";
const dbUser = process.env.DB_USER || "root";
const dbPassword = process.env.DB_PASSWORD || "";
const dbHost = process.env.DB_HOST || "127.0.0.1";
const dbPort = Number(process.env.DB_PORT || 3306);

export const sequelize = new Sequelize(dbName, dbUser, dbPassword, {
  host: dbHost,
  port: dbPort,
  dialect: "mysql",
  logging: false, // set to console.log to see SQL queries
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

export async function connectMySQL() {
  try {
    // Create database if it doesn't exist (MySQL specific)
    const { createConnection } = await import("mysql2/promise");
    const connection = await createConnection({ host: dbHost, port: dbPort, user: dbUser, password: dbPassword });
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();

    await sequelize.authenticate();
    console.log("MySQL Database connected successfully.");
    
    // Sync models
    await sequelize.sync({ alter: true });
    console.log("MySQL Models synchronized.");
  } catch (error) {
    console.error("Unable to connect to MySQL database:", error);
  }
}
