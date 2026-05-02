import { Request, Response } from "express";
import { AIReportModel } from "../models/AIReport.js";
import { InfectionImageModel } from "../models/InfectionImage.js";
import { PatientModel } from "../models/Patient.js";
import { runMockDentalDetection } from "../services/mockAi.js";
import { uploadImageMock } from "../services/uploadService.js";
import { catchAsync } from "../utils/catchAsync.js";

export const aiController = {
  detect: catchAsync(async (req: Request, res: Response) => {
    try {
      const { patientId, doctorId, imageName, symptomLabel } = req.body;
      const upload = await uploadImageMock(imageName || "infection.jpg");
      const result = runMockDentalDetection(symptomLabel || "general dental infection");

      const image = await InfectionImageModel.create({
        imageId: `IMG-${Date.now()}`,
        patientId,
        doctorId,
        imageUrl: upload.imageUrl
      });

      const report = await AIReportModel.create({
        reportId: `AIR-${Date.now()}`,
        patientId,
        doctorId,
        infectionName: result.infectionName,
        severity: result.severity,
        preventionTips: result.preventionTips,
        recommendedSpecialist: result.recommendedSpecialist
      });

      await PatientModel.findByIdAndUpdate(patientId, { infectionImage: image.imageUrl });

      res.status(201).json({ image, report });
    } catch (err) {
      console.warn("AI Detection failed (DB offline), returning mock result");
      res.status(201).json({ 
        image: { imageUrl: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=800" },
        report: { infectionName: "Gingivitis", severity: "Moderate", preventionTips: ["Brush twice a day", "Floss daily"], recommendedSpecialist: "Periodontist" }
      });
    }
  })
};
