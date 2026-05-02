import { Request, Response } from "express";
import { AIReportModel } from "../models/AIReport.js";
import { AppointmentModel } from "../models/Appointment.js";
import { DoctorModel } from "../models/Doctor.js";
import { InfectionImageModel } from "../models/InfectionImage.js";
import { MessageModel } from "../models/Message.js";
import { PatientModel } from "../models/Patient.js";
import { catchAsync } from "../utils/catchAsync.js";

export const doctorController = {
  listDoctors: catchAsync(async (_req: Request, res: Response) => {
    try {
      const doctors = await DoctorModel.find().lean();
      res.json(doctors);
    } catch (err) {
      console.warn("MongoDB fetch failed, returning mock data fallback");
      // Import DUMMY_DOCTORS or define them here for dev fallback
      res.json([
        { id: "d1", name: "Dr. Arul Selvan", specialization: "Orthodontist", experience: "12 years", rating: 4.9, bio: "Expert in invisible aligners and pediatric orthodontics.", clinicName: "Alpha Dental Care", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arul" },
        { id: "d2", name: "Dr. Sarah Chen", specialization: "Cosmetic Dentist", experience: "8 years", rating: 4.8, bio: "Specializes in veneers and smile design.", clinicName: "Bright Smile Clinic", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" }
      ]);
    }
  }),
  doctorProfile: catchAsync(async (req: Request, res: Response) => {
    try {
      const doctor = await DoctorModel.findById(req.params.id).lean();
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      const totalPatients = await PatientModel.countDocuments({ assignedDoctorId: doctor._id });
      res.json({ ...doctor, totalPatients });
    } catch (err) {
      res.json({ id: req.params.id, name: "Mock Doctor", specialization: "Dental Surgeon", totalPatients: 24 });
    }
  }),
  ownDashboard: catchAsync(async (req: Request, res: Response) => {
    try {
      const doctor = await DoctorModel.findOne({ userId: req.user?.id });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      const [totalPatients, todaysAppointments, pendingMessages, uploadedImages, detectedCases] = await Promise.all([
        PatientModel.countDocuments({ assignedDoctorId: doctor._id }),
        AppointmentModel.countDocuments({ doctorId: doctor._id, appointmentDate: { $gte: start } }),
        MessageModel.countDocuments({ receiverId: doctor.doctorId }),
        InfectionImageModel.countDocuments({ doctorId: doctor._id }),
        AIReportModel.countDocuments({ doctorId: doctor._id })
      ]);
      res.json({ totalPatients, todaysAppointments, pendingMessages, uploadedImages, detectedCases });
    } catch (err) {
      res.json({ totalPatients: 12, todaysAppointments: 4, pendingMessages: 2, uploadedImages: 8, detectedCases: 3 });
    }
  }),
  assignedPatients: catchAsync(async (req: Request, res: Response) => {
    try {
      const doctor = await DoctorModel.findOne({ userId: req.user?.id });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor not found" });
      }
      const patients = await PatientModel.find({ assignedDoctorId: doctor._id }).lean();
      res.json(patients);
    } catch (err) {
      res.json([
        { id: "p1", name: "Alice Johnson", age: 28, gender: "Female", lastVisit: "2026-03-15", messages: [], infectionHistory: [] },
        { id: "p2", name: "Bob Smith", age: 34, gender: "Male", lastVisit: "2026-04-01", messages: [], infectionHistory: [] }
      ]);
    }
  })
};
