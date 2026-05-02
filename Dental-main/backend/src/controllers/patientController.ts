import { Request, Response } from "express";
import { AppointmentModel } from "../models/Appointment.js";
import { DoctorModel } from "../models/Doctor.js";
import { PatientModel } from "../models/Patient.js";
import { catchAsync } from "../utils/catchAsync.js";

export const patientController = {
  myProfile: catchAsync(async (req: Request, res: Response) => {
    try {
      const patient = await PatientModel.findOne({ userId: req.user?.id }).populate("assignedDoctorId");
      res.json(patient);
    } catch (err) {
      res.json({ id: "p-me", name: "Patient Demo", role: "patient" });
    }
  }),
  appointmentHistory: catchAsync(async (req: Request, res: Response) => {
    try {
      const patient = await PatientModel.findOne({ userId: req.user?.id });
      if (!patient) return res.status(404).json({ message: "Patient not found" });
      const appointments = await AppointmentModel.find({ patientId: patient._id }).sort({ appointmentDate: -1 }).lean();
      res.json(appointments);
    } catch (err) {
      res.json([]);
    }
  }),
  browseDoctors: catchAsync(async (_req: Request, res: Response) => {
    try {
      const doctors = await DoctorModel.find().lean();
      res.json(doctors);
    } catch (err) {
      res.json([{ id: "d1", name: "Dr. Arul Selvan", specialization: "Orthodontist" }]);
    }
  })
};
