
export type Role = 'patient' | 'doctor';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  time: string;
  read: boolean;
  type: 'appointment_update' | 'system' | 'brushing_reminder' | 'ortho_update';
}

export interface BrushingSession {
  id: string;
  date: string;
  duration: number; // in seconds
  score: number;
  timeOfDay: 'morning' | 'night';
  completed: boolean;
}

export interface OrthoRecord {
  id: string;
  date: string;
  imageUrl: string;
  complianceScore: number;
  aiFeedback: string;
  status: 'excellent' | 'good' | 'needs_attention';
}

export interface TeamMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  fileUrl?: string;
  isUrgent?: boolean;
}

export interface EducationVideo {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: string;
  category: 'Implants' | 'Veneers' | 'Braces' | 'General';
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: string;
  mobile?: string;
  lastVisit: string;
  infectionHistory: InfectionRecord[];
  treatmentHistory: Treatment[];
  messages: Message[];
  healthMetrics: HealthMetric[];
  appointments: Appointment[];
  notifications?: Notification[];
  brushingSessions?: BrushingSession[];
  orthoRecords?: OrthoRecord[];
}

export interface Treatment {
  id: string;
  date: string;
  title: string;
  doctorName: string;
  notes: string;
  cost: string;
  prescriptions?: string[];
  followUpDate?: string;
}

export interface HealthMetric {
  id: string;
  label: string;
  value: string;
  status: 'good' | 'average' | 'poor';
  date: string;
}

export interface InfectionRecord {
  id: string;
  date: string;
  imageUrl: string;
  detection: string;
  prevention: string[];
  status: 'pending' | 'reviewed';
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: string;
  readStatus?: 'sent' | 'delivered' | 'read';
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  date: string;
  time: string;
  type: string;
  status: 'completed' | 'upcoming' | 'cancelled' | 'approved' | 'rescheduled';
  imageUrl?: string;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: string;
  rating: number;
  bio: string;
  clinicName: string;
  phone?: string;
  patients: Patient[];
  appointments: Appointment[];
  avatar: string;
  coordinates: { lat: number; lng: number };
  timings: string;
  dentalCollege: string;
  availableSlots: string[];
  gender: 'Male' | 'Female';
}
