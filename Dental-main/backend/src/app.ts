import cors from "cors";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { requireAuth } from "./middleware/auth.js";
import { createAuthRoutes } from "./routes/authRoutes.js";
import { createDoctorRoutes } from "./routes/doctorRoutes.js";
import { patientRoutes } from "./routes/patientRoutes.js";
import { appointmentRoutes } from "./routes/appointmentRoutes.js";
import { chatRoutes } from "./routes/chatRoutes.js";
import { aiRoutes } from "./routes/aiRoutes.js";

export function createApp(jwtSecret: string) {
  const app = express();
  const httpServer = createServer(app);
  const io = new Server(httpServer, { cors: { origin: "*" } });

  app.use(cors());
  app.use(express.json({ limit: "10mb" }));

  app.get("/api/health", (_req, res) => {
    res.json({ ok: true, service: "dental-care-ai-backend" });
  });

  app.use("/api/auth", createAuthRoutes(jwtSecret));
  app.use("/api/doctors", createDoctorRoutes(jwtSecret));
  app.use("/api/patients", requireAuth(jwtSecret), patientRoutes);
  app.use("/api/appointments", requireAuth(jwtSecret), appointmentRoutes);
  app.use("/api/chat", requireAuth(jwtSecret), chatRoutes);
  app.use("/api/ai", requireAuth(jwtSecret), aiRoutes);

  io.on("connection", (socket) => {
    socket.on("join-chat", (chatId: string) => {
      socket.join(chatId);
    });

    socket.on("send-message", (payload) => {
      io.to(payload.chatId).emit("new-message", {
        ...payload,
        timestamp: new Date().toISOString()
      });
    });
  });

  // Global Error Handler
  app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error("Express Error Handler:", err);
    res.status(500).json({ 
        message: err.message || "Internal Server Error",
        error: process.env.NODE_ENV === "development" ? err : {}
    });
  });

  return { app, httpServer };
}
