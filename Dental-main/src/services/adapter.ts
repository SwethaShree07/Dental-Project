import { Doctor, Patient } from '../types';

export const mapDoctorFromBackend = (data: any): Doctor => ({
  id: data.doctorId || data._id,
  name: data.name,
  specialization: data.specialization,
  experience: data.experience,
  rating: data.rating || 4.8,
  bio: data.bio || `Dr. ${data.name} is a highly experienced ${data.specialization} at ${data.clinicName}.`,
  clinicName: data.clinicName,
  patients: [], // To be populated if needed
  appointments: [], // To be populated if needed
  avatar: data.profilePhoto || `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.name}`,
  coordinates: data.coordinates || { lat: 12.9716, lng: 77.5946 },
  timings: data.timings || "09:00 AM - 05:00 PM",
  dentalCollege: data.dentalCollege || "Government Dental College",
  availableSlots: data.availableTimeSlots || ["09:00 AM", "10:00 AM", "11:00 AM", "02:00 PM", "03:00 PM", "04:00 PM"],
  gender: data.gender || 'Male',
});

export const mapPatientFromBackend = (data: any): Patient => ({
  id: data.patientId || data._id,
  name: data.name,
  age: data.age,
  gender: data.gender,
  mobile: data.phoneNumber,
  lastVisit: data.updatedAt ? new Date(data.updatedAt).toLocaleDateString() : new Date().toLocaleDateString(),
  infectionHistory: [],
  treatmentHistory: [],
  messages: [],
  healthMetrics: [],
  appointments: [],
  notifications: [],
});
