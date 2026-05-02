import { getToken } from './authService';

const IS_PROD = typeof window !== 'undefined' && 
  (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1');

const API_BASE = IS_PROD ? '/_/backend' : 'http://localhost:5000/api';


async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Handle unauthorized (optional: trigger logout)
  }

  return response;
}

export const apiService = {
  // --- Doctors ---
  getDoctors: async () => {
    const res = await fetchWithAuth('/doctors');
    if (!res.ok) throw new Error('Failed to fetch doctors');
    return res.json();
  },

  // --- Appointments ---
  bookAppointment: async (data: {
    doctorId: string;
    patientId: string;
    appointmentDate: string;
    timeSlot: string;
    reason?: string;
  }) => {
    const res = await fetchWithAuth('/appointments/book', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  createPatientAndBook: async (data: any) => {
    const res = await fetchWithAuth('/appointments/create-patient', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },

  getPatientAppointments: async () => {
    const res = await fetchWithAuth('/patients/me/appointments');
    return res.json();
  },

  getPatientProfile: async () => {
    const res = await fetchWithAuth('/patients/me');
    return res.json();
  },

  getDoctorDashboard: async () => {
    const res = await fetchWithAuth('/doctors/me/dashboard');
    return res.json();
  },

  getDoctorPatients: async () => {
    const res = await fetchWithAuth('/doctors/me/patients');
    return res.json();
  },

  // --- Scans ---
  saveScan: async (data: {
    imageUrl: string;
    detection: string;
    prevention: string;
    status: string;
  }) => {
    // Note: You may need a specific endpoint for saving clinical scan results to a profile
    // For now, we can use the existing aiRoutes or patient routes if they support it
    const res = await fetchWithAuth('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res.json();
  },
};
