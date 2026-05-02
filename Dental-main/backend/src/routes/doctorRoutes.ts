import { Router } from "express";
import { doctorController } from "../controllers/doctorController.js";
import { requireAuth } from "../middleware/auth.js";

export const createDoctorRoutes = (secret: string) => {
  const router = Router();

  // Public: List doctors for browsing and finding specialists
  router.get("/", doctorController.listDoctors);
  
  // Public-ish: View profile
  router.get("/:id", doctorController.doctorProfile);

  // Private: Doctor dashboard and patients
  router.get("/me/dashboard", requireAuth(secret), doctorController.ownDashboard);
  router.get("/me/patients", requireAuth(secret), doctorController.assignedPatients);

  return router;
};
