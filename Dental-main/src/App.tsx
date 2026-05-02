/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Stethoscope, 
  User, 
  MessageSquare, 
  Calendar, 
  Camera, 
  ChevronDown,
  ChevronRight, 
  Star, 
  Send, 
  ArrowLeft,
  Activity,
  ShieldCheck,
  Clock,
  Menu,
  X,
  Plus,
  Search,
  History,
  ClipboardList,
  CheckCircle2,
  Bot,
  LogOut,
  Building,
  Trash2,
  Phone,
  Info,
  Check,
  CheckCheck,
  Users,
  Settings,
  Key,
  GraduationCap,
  SlidersHorizontal,
  Bell,
  Video,
  Ban,
  CalendarClock,
  XCircle,
  Sparkles,
  Eye
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/card';
import { Input } from '@/components/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/avatar';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import { Toaster } from '@/components/sonner';
import { Calendar as CalendarUI } from '@/components/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/dialog';
import { Label } from '@/components/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/popover';
import { Separator } from '@/components/separator';
import { LoginPage } from './components/Login/Login';
import { ChatWindow } from './components/Chat/ChatWindow';
import { BookingModal } from './components/Booking/BookingModal';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { toast } from 'sonner';
import { DUMMY_DOCTORS } from './data';
import { Doctor, Patient, Message, InfectionRecord, Role, Treatment, Appointment } from './types';
import { analyzeDentalInfection, chatWithAI, getApiKey, setStoredApiKey, clearStoredApiKey } from './services/geminiService';
import { clearAuthSession, getAuthSession, validateSessionFromServer, AuthSession } from './services/authService';
import { format, subWeeks, subMonths, isAfter, parseISO } from 'date-fns';
import { LocationFeature } from './components/Location/LocationFeature';
import { MapPin } from 'lucide-react';
import { apiService } from './services/apiService';
import { mapDoctorFromBackend, mapPatientFromBackend } from './services/adapter';
import { KidsBrushingTracker } from './components/Brushing/KidsBrushingTracker';
import { OrthoMonitoring } from './components/Ortho/OrthoMonitoring';
import { TeleConsultation } from './components/Consultation/TeleConsultation';
import { InternalCommunicator } from './components/Internal/InternalCommunicator';
import { EducationHub } from './components/Education/EducationHub';

// --- Components ---

const RoleSwitcher = ({ currentRole, setRole }: { currentRole: Role, setRole: (r: Role) => void }) => (
  <div className="relative flex gap-1 rounded-full border border-white/70 bg-white/90 p-1 shadow-lg backdrop-blur-md">
    {/* Animated Sliding Pill */}
    <motion.div 
      className="absolute bg-blue-600 rounded-full"
      style={{ 
        width: '40px', 
        height: '40px',
        zIndex: 0 
      }}
      animate={{ 
        x: currentRole === 'patient' ? 0 : 44 
      }}
      transition={{ 
        type: "spring", 
        stiffness: 400, 
        damping: 30 
      }}
    />
    
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setRole('patient')}
      className={`relative z-10 rounded-full w-10 h-10 transition-colors duration-200 ${currentRole === 'patient' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
      title="Patient View"
    >
      <User className="w-5 h-5" />
    </Button>
    <Button 
      variant="ghost" 
      size="icon" 
      onClick={() => setRole('doctor')}
      className={`relative z-10 rounded-full w-10 h-10 transition-colors duration-200 ${currentRole === 'doctor' ? 'text-white' : 'text-slate-500 hover:text-slate-900'}`}
      title="Doctor View"
    >
      <Stethoscope className="w-5 h-5" />
    </Button>
  </div>
);


const MedicalHistory = ({ patient, onViewChange }: { patient: Patient, onViewChange?: (view: any) => void }) => {
  const [activeTab, setActiveTab] = useState<'list' | 'timeline' | 'appointments'>('list');

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {patient.healthMetrics.map((metric) => (
          <Card key={metric.id} className="border-none shadow-sm bg-slate-50 p-2 text-center">
            <p className="text-[10px] text-slate-400 uppercase font-bold">{metric.label}</p>
            <p className={`text-sm font-bold mt-1 ${
              metric.status === 'good' ? 'text-green-600' : 
              metric.status === 'average' ? 'text-yellow-600' : 'text-red-600'
            }`}>{metric.value}</p>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={(v: any) => setActiveTab(v)} className="w-full">
        <TabsList className="w-full grid grid-cols-3 rounded-xl bg-slate-100 p-1">
          <TabsTrigger value="list" className="rounded-lg text-xs">Medical</TabsTrigger>
          <TabsTrigger value="appointments" className="rounded-lg text-xs">Visits</TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg text-xs">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-4 space-y-6">
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center justify-between text-slate-700">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-blue-600" />
                Past Treatments
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2 text-blue-600" onClick={() => toast.success("Medical report downloaded successfully!")}>
                Download All
              </Button>
            </h4>
            <div className="space-y-3">
              {patient.treatmentHistory.map((t) => (
                <Card key={t.id} className="border-none shadow-sm bg-white overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h5 className="font-bold text-slate-800">{t.title}</h5>
                          <p className="text-xs text-slate-500">{t.date} • {t.doctorName}</p>
                        </div>
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-none">
                          {t.cost}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded-lg italic mb-3">
                        "{t.notes}"
                      </p>
                      
                      {t.prescriptions && t.prescriptions.length > 0 && (
                        <div className="space-y-1 mb-3">
                          <p className="text-[10px] font-bold text-slate-400 uppercase">Prescriptions</p>
                          <div className="flex flex-wrap gap-1">
                            {t.prescriptions.map((p, idx) => (
                              <Badge key={idx} variant="outline" className="text-[9px] py-0 px-1 border-blue-100 text-blue-600">
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {t.followUpDate && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                          <Clock className="w-3 h-3" />
                          Follow-up: {t.followUpDate}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2 text-slate-700">
              <Activity className="w-5 h-5 text-red-600" />
              Infection History
            </h4>
            {patient.infectionHistory.length > 0 ? (
              <div className="space-y-4">
                {patient.infectionHistory.map(record => (
                  <Card key={record.id} className="overflow-hidden border-none shadow-md bg-white ring-1 ring-slate-100">
                    <div className="flex flex-col">
                      <div className="relative h-32 w-full overflow-hidden">
                        <img 
                          src={record.imageUrl} 
                          alt="Scan" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute top-2 right-2">
                          <Badge className="bg-white/90 backdrop-blur-md text-blue-600 border-none text-[10px]">
                            {record.date}
                          </Badge>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">AI Detection</p>
                          <p className="text-sm font-bold text-slate-800 leading-tight">"{record.detection}"</p>
                        </div>
                        <div className="space-y-1.5 pt-2 border-t border-slate-50">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prevention Tips</p>
                          <div className="flex flex-wrap gap-1.5">
                            {record.prevention.map((p, i) => (
                              <Badge key={i} variant="secondary" className="bg-slate-50 text-slate-600 py-1 px-2 border-none text-[9px] font-medium">
                                <CheckCircle2 className="w-2.5 h-2.5 mr-1 text-green-500" />
                                {p}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <ShieldCheck className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No infection history recorded</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="mt-4 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h4 className="font-semibold text-slate-700">Your Appointments</h4>
            <Badge variant="outline" className="text-[10px]">{patient.appointments.length} Total</Badge>
          </div>
          <div className="space-y-3">
            {patient.appointments.length > 0 ? (
              patient.appointments.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(appt => (
                <Card key={appt.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow ring-1 ring-slate-100">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${appt.status === 'upcoming' ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                          <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{appt.type}</p>
                          <p className="text-[10px] text-slate-400">{format(new Date(appt.date), 'MMMM dd, yyyy')} • {appt.time}</p>
                        </div>
                      </div>
                      <Badge className={`text-[9px] border-none px-2 ${
                        appt.status === 'upcoming' ? 'bg-blue-100 text-blue-700' : 
                        appt.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {appt.status}
                      </Badge>
                    </div>
                    <div className="border-t border-slate-50 pt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-6 h-6">
                          <AvatarFallback className="text-[8px]">DR</AvatarFallback>
                        </Avatar>
                        <p className="text-[10px] font-medium text-slate-600">Attended by Specialists</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600 hover:bg-blue-50">Details</Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Calendar className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <h5 className="text-sm font-bold text-slate-400">No appointments yet</h5>
                <Button variant="link" size="sm" className="text-blue-600 text-[11px]" onClick={() => onViewChange?.('home')}>Book your first visit</Button>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="timeline" className="mt-4">
          <div className="relative pl-6 border-l-2 border-blue-100 space-y-8 ml-2">
            {[...patient.treatmentHistory, ...patient.infectionHistory.map(i => ({ ...i, title: i.detection, isScan: true }))]
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((item: any, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm ${item.isScan ? 'bg-red-500' : 'bg-blue-500'}`} />
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</p>
                    <h5 className="font-bold text-slate-800 text-sm">{item.title}</h5>
                    <p className="text-xs text-slate-600">{item.notes || (item.isScan ? 'AI Infection Scan' : '')}</p>
                    {item.isScan && (
                      <Badge variant="outline" className="text-[9px] border-red-100 text-red-600 mt-1">AI Analysis</Badge>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};


const getScanUrgency = (record: InfectionRecord) => {
  const summary = `${record.detection} ${record.prevention.join(' ')}`.toLowerCase();

  if (summary.includes('abscess') || summary.includes('severe') || summary.includes('spread') || summary.includes('urgent')) {
    return {
      label: 'High Priority',
      score: 88,
      tone: 'text-red-700 bg-red-50 border-red-100',
      actions: [
        'Book a dentist visit within 24 hours.',
        'Avoid pressure on the affected tooth.',
        'Monitor swelling, fever, or bad taste immediately.',
      ],
    };
  }

  if (summary.includes('infection') || summary.includes('inflamed') || summary.includes('cavity') || summary.includes('gum')) {
    return {
      label: 'Needs Review',
      score: 64,
      tone: 'text-amber-700 bg-amber-50 border-amber-100',
      actions: [
        'Arrange a checkup in the next few days.',
        'Stick to soft brushing and warm-water rinses.',
        'Track whether pain is improving or worsening.',
      ],
    };
  }

  return {
    label: 'Monitor',
    score: 36,
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    actions: [
      'Continue your oral hygiene routine carefully.',
      'Watch for changes in pain, odor, or swelling.',
      'Keep a follow-up scan or checkup scheduled.',
    ],
  };
};

// --- Components ---

const CameraModal = ({ 
  isOpen, 
  onClose, 
  onCapture 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onCapture: (base64: string) => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => {
          console.error("Camera error:", err);
          toast.error("Could not access camera. Please check permissions.");
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    }
  }, [isOpen]);

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const base64 = canvas.toDataURL('image/jpeg');
        onCapture(base64);
        onClose();
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl rounded-3xl border border-slate-200 bg-black p-0 overflow-hidden shadow-2xl">
        <div className="relative w-full aspect-[4/3] bg-black flex items-center justify-center">
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 pointer-events-none border-[4px] border-black/10" />
          <Button 
            variant="ghost" 
            size="icon" 
            className="absolute top-4 right-4 bg-black/50 text-white rounded-full hover:bg-black/70 z-50"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          
          <div className="absolute bottom-6 w-full flex justify-center z-50">
            <Button
              className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30 backdrop-blur-md border-4 border-white flex items-center justify-center shadow-lg"
              onClick={capturePhoto}
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center">
                <Camera className="w-5 h-5 text-slate-900" />
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const CancelAppointmentModal = ({
  isOpen,
  onClose,
  onConfirm
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) => {
  const [presetReason, setPresetReason] = useState<string>('Patient no-show');
  const [customReason, setCustomReason] = useState<string>('');

  const handleConfirm = () => {
    const finalReason = presetReason === 'Other' ? customReason : presetReason;
    if (!finalReason.trim()) {
      toast.error('Please specify a reason');
      return;
    }
    onConfirm(finalReason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Ban className="w-5 h-5" />
            Cancel Appointment
          </DialogTitle>
          <DialogDescription>
            Please provide a cancellation reason. This will be sent to the patient.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Select Reason</Label>
            <Select value={presetReason} onValueChange={(v) => v && setPresetReason(v)}>
              <SelectTrigger className="h-11 rounded-2xl">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Doctor unavailable">Doctor unavailable</SelectItem>
                <SelectItem value="Clinic is closed">Clinic is closed</SelectItem>
                <SelectItem value="Patient no-show">Patient no-show</SelectItem>
                <SelectItem value="Schedule conflict">Schedule conflict</SelectItem>
                <SelectItem value="Other">Other (Type below)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {presetReason === 'Other' && (
            <div className="space-y-2">
              <Label>Description</Label>
              <textarea 
                className="w-full flex min-h-[80px] rounded-2xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Enter cancellation reason..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Back</Button>
          <Button variant="destructive" className="rounded-xl flex-1 bg-red-600 hover:bg-red-700" onClick={handleConfirm}>Cancel Appointment</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Components ---

const SettingsModal = ({ 
  isOpen, 
  onClose 
}: { 
  isOpen: boolean, 
  onClose: () => void 
}) => {
  const [apiKey, setApiKey] = useState(getApiKey());

  const handleSave = () => {
    setStoredApiKey(apiKey);
    toast.success("API Settings saved successfully");
    onClose();
  };

  const handleClear = () => {
    clearStoredApiKey();
    setApiKey('');
    toast.info("API Key cleared");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md rounded-3xl border border-slate-200 bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-slate-600" />
            AI Configuration
          </DialogTitle>
          <DialogDescription>
            Configure your Gemini API key to enable AI-powered dental analysis and chat.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="w-4 h-4 text-slate-400" />
              Gemini API Key
            </Label>
            <Input
              type="password"
              placeholder="Paste your API key here"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="h-11 rounded-2xl bg-white border-slate-200 focus:ring-blue-500"
            />
            <p className="text-[10px] text-slate-400 flex items-center gap-1 ml-1">
              <Info className="w-3 h-3" />
              Your key is stored locally in your browser.
            </p>
          </div>
        </div>
        <DialogFooter className="flex gap-2 sm:justify-between px-0">
          <Button 
            variant="ghost" 
            className="rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleClear}
          >
            Clear Key
          </Button>
          <Button 
            className="rounded-xl bg-blue-600 px-8"
            onClick={handleSave}
          >
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Main App ---

export default function App() {
  const initialSession = getAuthSession();
  const [session, setSession] = useState<AuthSession | null>(initialSession);
  const [role, setRole] = useState<Role>(session?.role ?? 'patient');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(initialSession));

  // On mount: validate saved token against the server (cross-device session check)
  useEffect(() => {
    if (initialSession) {
      validateSessionFromServer().then(serverSession => {
        if (serverSession) {
          setSession(serverSession);
          setRole(serverSession.role);
          setIsAuthenticated(true);
        } else {
          // Token invalid/expired — force logout
          setSession(null);
          setIsAuthenticated(false);
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [view, setView] = useState<'home' | 'doctor-profile' | 'scan' | 'chat' | 'dashboard' | 'patient-detail' | 'history' | 'ai-chat' | 'nearby' | 'brushing-tracker' | 'ortho-monitoring' | 'tele-consultation' | 'internal-communicator' | 'education-hub'>('home');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedSpecialistId, setSelectedSpecialistId] = useState<string | null>(null);
  const [patientName, setPatientName] = useState('');
  const [patientAge, setPatientAge] = useState('');
  const [patientMobile, setPatientMobile] = useState('');
  const [patientGender, setPatientGender] = useState('Male');
  const [hasVisitedBefore, setHasVisitedBefore] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<InfectionRecord | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>(DUMMY_DOCTORS);

  const fetchLatestData = async () => {
    try {
      const backendDoctors = await apiService.getDoctors();
      let mappedDoctors = backendDoctors.map(mapDoctorFromBackend);

      if (isAuthenticated && role === 'patient') {
        const patientProfile = await apiService.getPatientProfile();
        if (patientProfile) {
          const mappedPatient = { 
            ...mapPatientFromBackend(patientProfile),
            id: 'p-me' // Anchor ID for logged-in user UI
          };
          setSelectedPatient(mappedPatient);
          
          // Also fetch appointments
          const appts = await apiService.getPatientAppointments();
          if (appts) {
            mappedPatient.appointments = appts.map((a: any) => ({
              id: a.appointmentId,
              patientId: 'p-me',
              patientName: mappedPatient.name,
              date: a.appointmentDate,
              time: a.timeSlot,
              type: a.reason || 'General Checkup',
              status: a.status
            }));
          }
        }
      } else if (isAuthenticated && role === 'doctor') {
        const dashboard = await apiService.getDoctorDashboard();
        const drPatients = await apiService.getDoctorPatients();
        // Here we could update doctor metrics/stats if we had state for it
      }

      setDoctors(mappedDoctors);
    } catch (err: any) {
      if (err.message?.includes('401') || err.message?.includes('Unauthorized')) {
        console.warn('Authentication expired or invalid. Please sign in again.');
        // Optionally: handleLogout();
      } else {
        console.error('Failed to sync with centralized database:', err);
      }
    }
  };


  useEffect(() => {
    fetchLatestData();
  }, [isAuthenticated]);

  const [currentDoctorId, setCurrentDoctorId] = useState<string>(doctors[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [genderFilter, setGenderFilter] = useState('all');
  const [hospitalFilter, setHospitalFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'rating' | 'experience'>('rating');
  const [showAllDoctors, setShowAllDoctors] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [doctorActiveTab, setDoctorActiveTab] = useState('dashboard');

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [appointmentToCancel, setAppointmentToCancel] = useState<{doctorId: string, patientId: string, appointmentId: string} | null>(null);

  const handleAppointmentAction = (doctorId: string, patientId: string, appointmentId: string, newStatus: 'approved' | 'rescheduled' | 'cancelled', reason?: string) => {
    const newNotification: import('./types').Notification = {
      id: `notif-${Date.now()}`,
      title: `Appointment ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
      message: `Your appointment has been ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
      type: 'appointment_update' // Added missing property type
    };

    setDoctors(prev => prev.map(doctor => {
      if (doctor.id !== doctorId) return doctor;
      
      // Fix notification message with doctor's name
      const doctorNotification = {
        ...newNotification,
        message: `Your appointment with ${doctor.name} has been ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`
      };

      const mapAppt = (a: Appointment) => a.id === appointmentId ? { ...a, status: newStatus as any } : a;

      return {
        ...doctor,
        appointments: doctor.appointments.map(mapAppt),
        patients: doctor.patients.map(p => p.id === patientId ? {
          ...p,
          appointments: p.appointments.map(mapAppt),
          notifications: [doctorNotification, ...(p.notifications || [])]
        } : p)
      };
    }));

    if (selectedDoctor && selectedDoctor.id === doctorId) {
      setSelectedDoctor(prev => {
        if (!prev) return null;
        
        const doctorNotification = {
          ...newNotification,
          message: `Your appointment with ${prev.name} has been ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`
        };

        const mapAppt = (a: Appointment) => a.id === appointmentId ? { ...a, status: newStatus as any } : a;
        return {
          ...prev,
          appointments: prev.appointments.map(mapAppt),
          patients: prev.patients.map(p => p.id === patientId ? {
            ...p,
            appointments: p.appointments.map(mapAppt),
            notifications: [doctorNotification, ...(p.notifications || [])]
          } : p)
        };
      });
    }

    if (selectedPatient && selectedPatient.id === patientId) {
      setSelectedPatient(prev => {
        if (!prev) return null;
        const doctorNotification = {
          ...newNotification,
          message: `Your appointment has been ${newStatus}. ${reason ? `Reason: ${reason}` : ''}`
        };
        const mapAppt = (a: Appointment) => a.id === appointmentId ? { ...a, status: newStatus as any } : a;
        return {
          ...prev,
          appointments: prev.appointments.map(mapAppt),
          notifications: [doctorNotification, ...(prev.notifications || [])]
        };
      });
    }
  };

  const currentDoctor = doctors.find(d => d.id === currentDoctorId) || doctors[0];

  const handleLogin = (selectedRole: Role) => {
    const newSession = getAuthSession();
    setSession(newSession);
    setRole(selectedRole);
    setIsAuthenticated(true);
    setView('home');
  };

  const handleLogout = () => {
    clearAuthSession();
    window.location.reload();
  };

  const aiQuickPrompts = [
    { label: 'Tooth Pain', prompt: 'I have tooth pain while chewing. What should I do first?' },
    { label: 'Bleeding Gums', prompt: 'My gums bleed while brushing. What could be causing it?' },
    { label: 'Braces Care', prompt: 'Give me a simple daily braces care routine.' },
    { label: 'After Extraction', prompt: 'What care steps should I follow after a tooth extraction?' },
  ];

  const createCurrentUserPatient = (): Patient => ({
    id: 'p-me',
    name: session?.name || 'Surendhar',
    age: 29,
    gender: 'Male',
    mobile: '9999999999',
    lastVisit: format(new Date(), 'yyyy-MM-dd'),
    infectionHistory: [],
    treatmentHistory: [],
    messages: [],
    healthMetrics: [],
    appointments: [],
    notifications: [],
  });

  const openDoctorChat = (doctor: Doctor) => {
    const currentUserThread = doctor.patients.find((patient) => patient.id === 'p-me') || createCurrentUserPatient();
    setSelectedDoctor(doctor);
    setSelectedPatient(currentUserThread);
    setView('chat');
  };

  const generateDoctorAutoReply = (text: string, doctorName: string) => {
    const message = text.toLowerCase();

    if (message.includes('pain') || message.includes('hurts') || message.includes('swelling')) {
      return `I understand you're dealing with pain. Please avoid very hot or cold foods for now, and if the swelling is increasing, book an in-person visit with ${doctorName} as soon as possible.`;
    }

    if (message.includes('bleeding') || message.includes('gum')) {
      return `Bleeding gums can happen from irritation or buildup. Use a soft brush today, don't scrub hard, and we'll want to examine your gums if this continues for more than a couple of days.`;
    }

    if (message.includes('appointment') || message.includes('book') || message.includes('visit')) {
      return `Your message is noted. I can help you with an appointment and next steps. Please share your preferred day or time, and we'll line it up from the clinic side.`;
    }

    if (message.includes('medicine') || message.includes('tablet') || message.includes('antibiotic')) {
      return `Please don't start or stop dental medication without a review. Share the medicine name if you have it, and I'll guide you on whether it matches your dental issue.`;
    }

    if (message.includes('thank')) {
      return `You're welcome. Keep me updated on your symptoms, and if anything worsens, message again or come in for a visit.`;
    }

    return `Thanks for the update. I’ve reviewed your message and I’d like to understand it a little better. Tell me when it started and whether the discomfort is mild, moderate, or severe.`;
  };

  const upsertPatientThread = (patients: Patient[], patientId: string, updater: (patient: Patient) => Patient) => {
    const existingPatient = patients.find((patient) => patient.id === patientId);

    if (existingPatient) {
      return patients.map((patient) => (patient.id === patientId ? updater(patient) : patient));
    }

    if (patientId !== 'p-me') {
      return patients;
    }

    const currentUserPatient = updater(createCurrentUserPatient());
    return [currentUserPatient, ...patients];
  };

  const deletePatient = (patientId: string) => {
    setDoctors(prev => prev.map(d => ({
      ...d,
      patients: d.patients.filter(p => p.id !== patientId)
    })));
    if (selectedPatient?.id === patientId) {
      setSelectedPatient(null);
      setView('home');
    }
    toast.success("Patient record deleted permanently");
  };

  const [aiMessages, setAiMessages] = useState<Message[]>([
    {
      id: 'ai-welcome',
      senderId: 'ai',
      receiverId: 'me',
      text: "Hello! I'm your Alpha Dent AI Assistant. How can I help you with your dental health today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  // --- Dashboard Selectors ---
  const todayString = format(new Date(), 'yyyy-MM-dd');
  
  const upcomingAppointmentsCount = doctors.reduce((acc, doc) => 
    acc + doc.appointments.filter(a => a.status === 'upcoming').length, 0
  );

  const pendingReviewsCount = currentDoctor.patients.reduce((acc, p) => 
    acc + p.infectionHistory.filter(r => r.status === 'pending').length, 0
  );

  const todayAppointments = currentDoctor.appointments.filter(a => 
    a.date === todayString && a.status === 'upcoming'
  ).length;

  const unreadDoctorMessages = currentDoctor.patients.reduce((acc, p) => 
    acc + p.messages.filter(m => m.readStatus !== 'read' && m.senderId !== currentDoctor.id).length, 0
  );

  const attentionPatients = pendingReviewsCount;

  useEffect(() => {
    const patientViews = new Set(['home', 'doctor-profile', 'scan', 'chat', 'history', 'ai-chat', 'nearby']);
    const doctorViews = new Set(['home', 'patient-detail', 'chat']);

    if (role === 'patient' && !patientViews.has(view)) {
      setView('home');
      setSelectedPatient(null);
    }

    if (role === 'doctor' && !doctorViews.has(view)) {
      setView('home');
      setSelectedDoctor(null);
    }
  }, [role, view]);

  const processCameraCapture = async (base64: string) => {
    setIsScanning(true);
    setScanImage(base64);
    try {
      const result = await analyzeDentalInfection(base64);
      const newRecord: import('./types').InfectionRecord = {
        id: Math.random().toString(36).substr(2, 9),
        date: new Date().toLocaleDateString(),
        imageUrl: base64,
        detection: result.detection,
        prevention: result.prevention,
        status: 'pending'
      };
      setScanResult(newRecord);
      toast.success("AI Analysis Complete!");
    } catch (error) {
      console.error("Scan error:", error);
      toast.error("Failed to analyze image. Please try again.");
      setScanImage(null);
    } finally {
      setIsScanning(false);
    }
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 2) {
      toast.error("Please select a maximum of 2 images.");
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      try {
        const base64 = reader.result as string;
        const result = await analyzeDentalInfection(base64);
        
        const newRecord: import('./types').InfectionRecord = {
          id: Math.random().toString(36).substr(2, 9),
          date: new Date().toLocaleDateString(),
          imageUrl: base64,
          detection: result.detection,
          prevention: result.prevention,
          status: 'pending'
        };

        setScanResult(newRecord);
        
        // Save scan to centralized database if authenticated
        if (isAuthenticated) {
          apiService.saveScan({
            imageUrl: base64,
            detection: result.detection,
            prevention: result.prevention.join(', '),
            status: 'pending'
          }).then(() => {
            fetchLatestData(); // Sync state
          }).catch(err => console.error('Database sync for scan failed:', err));
        }

        // Keep local state for immediate UI feedback
        setDoctors(prev => prev.map(d => ({
          ...d,
          patients: d.patients.map(p => 
            p.id === 'p-me' 
              ? { ...p, infectionHistory: [newRecord, ...p.infectionHistory] }
              : p
          )
        })));

        toast.success("AI Analysis Complete!");

      } catch (error) {
        console.error("Scan error:", error);
        toast.error("Failed to analyze image. Please try again.");
        setScanImage(null);
      } finally {
        setIsScanning(false);
        e.target.value = '';
      }
    };
    
    // Set preview immediately
    const previewReader = new FileReader();
    previewReader.onloadend = () => setScanImage(previewReader.result as string);
    previewReader.readAsDataURL(file);
    
    reader.readAsDataURL(file);
  };

  const sendMessage = (text: string, toId: string, fromId: string = 'me') => {
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: fromId,
      receiverId: toId,
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: 'sent'
    };

    // Update local state to simulate persistence
    setDoctors(prev => prev.map(d => {
      if (d.id === toId || d.id === fromId) {
        const targetPatientId = fromId === 'me' ? 'p-me' : toId;

        return {
          ...d,
          patients: upsertPatientThread(d.patients, targetPatientId, (patient) => ({
            ...patient,
            messages: [...patient.messages, newMessage],
          })),
        };
      }
      return d;
    }));

    // Update selectedDoctor if it's the one we're chatting with
    if (selectedDoctor && (selectedDoctor.id === toId || selectedDoctor.id === fromId)) {
      setSelectedDoctor(prev => {
        if (!prev) return null;
        const targetPatientId = fromId === 'me' ? 'p-me' : toId;
        return {
          ...prev,
          patients: upsertPatientThread(prev.patients, targetPatientId, (patient) => ({
            ...patient,
            messages: [...patient.messages, newMessage],
          })),
        };
      });
    }

    // Update selectedPatient if it's the one we're chatting with
    const isPatientThreadOpen =
      !!selectedPatient &&
      (
        selectedPatient.id === toId ||
        selectedPatient.id === fromId ||
        (role === 'patient' && selectedPatient.id === 'p-me' && !!selectedDoctor && (selectedDoctor.id === toId || selectedDoctor.id === fromId))
      );

    if (isPatientThreadOpen) {
      setSelectedPatient(prev => {
        if (!prev) return null;
        return {
          ...prev,
          messages: [...prev.messages, newMessage]
        };
      });
    }

    // Simulate quick response from doctor if patient sends
    if (role === 'patient' && fromId === 'me') {
      // Simulate status updates for the sent message
      setTimeout(() => {
        setDoctors(prev => prev.map(d => (
          d.id === toId
            ? {
                ...d,
                patients: upsertPatientThread(d.patients, 'p-me', (patient) => ({
                  ...patient,
                  messages: patient.messages.map(m => m.id === newMessage.id ? { ...m, readStatus: 'delivered' } : m),
                })),
              }
            : d
        )));
      }, 1000);

      setTimeout(() => {
        setDoctors(prev => prev.map(d => (
          d.id === toId
            ? {
                ...d,
                patients: upsertPatientThread(d.patients, 'p-me', (patient) => ({
                  ...patient,
                  messages: patient.messages.map(m => m.id === newMessage.id ? { ...m, readStatus: 'read' } : m),
                })),
              }
            : d
        )));
      }, 2000);

      setTimeout(() => {
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: toId,
          receiverId: 'me',
          text: generateDoctorAutoReply(text, selectedDoctor?.name || 'the doctor'),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readStatus: 'read'
        };
        
        setDoctors(prev => prev.map(d => {
          if (d.id === toId) {
            return {
              ...d,
              patients: upsertPatientThread(d.patients, 'p-me', (patient) => ({
                ...patient,
                messages: [...patient.messages, response],
              })),
            };
          }
          return d;
        }));

        if (selectedDoctor && selectedDoctor.id === toId) {
          setSelectedDoctor(prev => {
            if (!prev) return null;
            return {
              ...prev,
              patients: upsertPatientThread(prev.patients, 'p-me', (patient) => ({
                ...patient,
                messages: [...patient.messages, response],
              })),
              };
          });
        }

        if (role === 'patient' && selectedPatient?.id === 'p-me' && selectedDoctor?.id === toId) {
          setSelectedPatient(prev => {
            if (!prev) return null;
            return {
              ...prev,
              messages: [...prev.messages, response]
            };
          });
        }
      }, 1500);
    }
  };

  const sendAIMessage = async (text: string) => {
    const trimmedText = text.trim();
    if (!trimmedText) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      receiverId: 'ai',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const history = [...aiMessages, userMsg].map(m => ({
      role: m.senderId === 'me' ? 'user' as const : 'model' as const,
      parts: [{ text: m.text }]
    }));

    setAiMessages(prev => [...prev, userMsg]);

    const aiResponse = await chatWithAI(trimmedText, history);

    const aiMsg: Message = {
      id: (Date.now() + 1).toString(),
      senderId: 'ai',
      receiverId: 'me',
      text: aiResponse,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiMessages(prev => [...prev, aiMsg]);
  };

  const filteredDoctors = doctors
    .filter(d => {
      const matchesSearch = 
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        d.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.clinicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.dentalCollege.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesUniversity = hospitalFilter === 'all' || d.clinicName === hospitalFilter;
      
      return matchesSearch && matchesUniversity;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'experience') {
        const expA = parseInt(a.experience) || 0;
        const expB = parseInt(b.experience) || 0;
        return expB - expA;
      }
      return 0;
    });


  const handleAppointmentBooking = (doctorId: string, booking: {
    date: Date;
    time: string;
    patientName: string;
    patientAge: string;
    patientMobile: string;
    patientGender: string;
    appointmentType: string;
    imageUrl?: string;
  }) => {
    const formattedDate = format(booking.date, 'yyyy-MM-dd');
    const existingDoctor = doctors.find((d) => d.id === doctorId);
    const existingPatient = existingDoctor?.patients.find(
      (p) => p.name.toLowerCase() === booking.patientName.trim().toLowerCase() && p.mobile === booking.patientMobile.trim()
    );

    // If the booking is made by the logged-in patient, always use p-me so notifications route correctly
    const patientId = role === 'patient' ? 'p-me' : (existingPatient?.id || `p-${Date.now()}`);
    const appointment: Appointment = {
      id: `app-${doctorId}-${Date.now()}`,
      patientId,
      patientName: booking.patientName.trim(),
      date: formattedDate,
      time: booking.time,
      type: booking.appointmentType,
      status: 'upcoming',
      imageUrl: booking.imageUrl,
    };

    // Auto-sync with Database in the background
    try {
      apiService.createPatientAndBook({
        doctorMongoId: doctorId,
        name: booking.patientName.trim(),
        age: Number(booking.patientAge),
        gender: booking.patientGender,
        phoneNumber: booking.patientMobile.trim(),
        dentalProblem: booking.appointmentType,
        appointmentDate: formattedDate,
        timeSlot: booking.time,
      }).then(() => {
        fetchLatestData(); // Refresh state from central DB
      }).catch(err => console.log('DB sync failed (non-critical):', err));
    } catch (error) {
      console.log('DB sync error:', error);
    }

    setDoctors((prev) =>
      prev.map((doctor) => {
        if (doctor.id !== doctorId) return doctor;

        const updatedPatients = existingPatient
          ? doctor.patients.map((patient) =>
              patient.id === existingPatient.id
                ? {
                    ...patient,
                    name: booking.patientName.trim(),
                    age: Number(booking.patientAge),
                    gender: booking.patientGender,
                    mobile: booking.patientMobile.trim(),
                    appointments: [appointment, ...patient.appointments],
                    infectionHistory: scanResult && !patient.infectionHistory.some(r => r.id === scanResult.id) ? [scanResult, ...patient.infectionHistory] : patient.infectionHistory,
                  }
                : patient
            )
          : [
              {
                id: patientId,
                name: booking.patientName.trim(),
                age: Number(booking.patientAge),
                gender: booking.patientGender,
                mobile: booking.patientMobile.trim(),
                lastVisit: formattedDate,
                infectionHistory: scanResult ? [scanResult] : [],
                treatmentHistory: [],
                messages: [],
                healthMetrics: [],
                appointments: [appointment],
                notifications: [],
              },
              ...doctor.patients,
            ];

        return {
          ...doctor,
          patients: updatedPatients,
          appointments: [appointment, ...doctor.appointments],
        };
      })
    );

    setSelectedDoctor((prev) => {
      if (!prev || prev.id !== doctorId) return prev;

      const updatedPatients = existingPatient
        ? prev.patients.map((patient) =>
            patient.id === existingPatient.id
              ? {
                  ...patient,
                  name: booking.patientName.trim(),
                  age: Number(booking.patientAge),
                  gender: booking.patientGender,
                  mobile: booking.patientMobile.trim(),
                  appointments: [appointment, ...patient.appointments],
                  infectionHistory: scanResult && !patient.infectionHistory.some(r => r.id === scanResult.id) ? [scanResult, ...patient.infectionHistory] : patient.infectionHistory,
                }
              : patient
          )
        : [
            {
              id: patientId,
              name: booking.patientName.trim(),
              age: Number(booking.patientAge),
              gender: booking.patientGender,
              mobile: booking.patientMobile.trim(),
              lastVisit: formattedDate,
              infectionHistory: scanResult ? [scanResult] : [],
              treatmentHistory: [],
              messages: [],
              healthMetrics: [],
              appointments: [appointment],
              notifications: [],
            },
            ...prev.patients,
          ];

      return {
        ...prev,
        patients: updatedPatients,
        appointments: [appointment, ...prev.appointments],
      };
    });

    setIsBookingModalOpen(false);
    toast.success(`Appointment booked for ${booking.patientName.trim()} on ${format(booking.date, 'PPP')} at ${booking.time}`);
  };

  return (
    <div
      className={`bg-white font-sans text-slate-900 ${
        isAuthenticated ? 'h-[100dvh] overflow-hidden' : 'min-h-[100dvh]'
      }`}
    >
      <Toaster position="top-center" />

      <AnimatePresence mode="wait">
        {!isAuthenticated ? (
          <motion.div
            key="login"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <LoginPage onLogin={handleLogin} />
          </motion.div>
        ) : role === 'patient' ? (
          <motion.div 
            key="patient-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-white"
          >
            {view === 'home' && (
              <div className="flex h-full flex-col gap-5 overflow-y-auto px-4 pb-28 pt-20 md:px-5">
                <header className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center">
                      <img src="/icon.png" alt="Dental Logo" className="h-10 w-10 object-contain" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-950">Alpha Dent</h1>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Circular profile avatar */}
                    <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-full pl-1 pr-3 py-1">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                        {(session?.name || 'P').charAt(0).toUpperCase()}
                      </div>
                      <span className="text-xs font-semibold text-slate-700 max-w-[80px] truncate">{session?.name?.split(' ')[0] || 'Patient'}</span>
                    </div>
                    {(() => {
                      // Aggregate all notifications for the logged-in patient (p-me) across all doctors
                      const myNotifications = doctors.flatMap(d =>
                        d.patients.filter(p => p.id === 'p-me').flatMap(p => p.notifications || [])
                      );
                      const unreadCount = myNotifications.filter(n => !n.read).length;

                      const markAllRead = () => {
                        setDoctors(prev => prev.map(d => ({
                          ...d,
                          patients: d.patients.map(p =>
                            p.id === 'p-me'
                              ? { ...p, notifications: (p.notifications || []).map(n => ({ ...n, read: true })) }
                              : p
                          )
                        })));
                        if (selectedPatient?.id === 'p-me') {
                          setSelectedPatient(prev => prev ? ({ ...prev, notifications: (prev.notifications || []).map(n => ({ ...n, read: true })) }) : prev);
                        }
                      };

                      return (
                        <Popover onOpenChange={(open) => { if (open && unreadCount > 0) markAllRead(); }}>
                          <PopoverTrigger className="relative rounded-full h-10 w-10 text-slate-400 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center">
                            <Bell className="w-5 h-5" />
                            {unreadCount > 0 && (
                              <div className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white" />
                            )}
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0 mr-4 rounded-3xl border border-slate-200 bg-white shadow-2xl" align="end">
                            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                              <h4 className="font-semibold text-slate-900">Notifications</h4>
                              {unreadCount > 0 && (
                                <Badge variant="secondary" className="bg-blue-50 text-blue-600">
                                  {unreadCount} New
                                </Badge>
                              )}
                            </div>
                            <ScrollArea className="h-[300px]">
                              {myNotifications.length > 0 ? (
                                <div className="divide-y divide-slate-100">
                                  {myNotifications.map((notif, idx) => (
                                    <div key={notif.id || `notif-${idx}`} className={`p-4 transition-colors ${notif.read ? 'bg-transparent' : 'bg-blue-50/50'}`}>
                                      <div className="flex items-start gap-3">
                                        <div className={`mt-0.5 p-2 rounded-full ${notif.title.includes('cancelled') || notif.title.toLowerCase().includes('cancel') ? 'bg-red-100 text-red-600' : notif.title.toLowerCase().includes('approved') ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                          <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 space-y-1">
                                          <div className="flex items-center justify-between">
                                            <p className={`text-sm font-semibold ${notif.read ? 'text-slate-700' : 'text-slate-900'}`}>{notif.title}</p>
                                            <span className="text-[10px] text-slate-400">{notif.time}</span>
                                          </div>
                                          <p className="text-xs text-slate-500 leading-snug">{notif.message}</p>
                                          <p className="text-[10px] text-slate-400">{notif.date}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="px-4 py-8 text-center">
                                  <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                  <p className="text-sm text-slate-500">No notifications yet</p>
                                </div>
                              )}
                            </ScrollArea>
                          </PopoverContent>
                        </Popover>
                      );
                    })()}
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={handleLogout}
                      className="rounded-full h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-5 h-5" />
                    </Button>
                  </div>
                </header>

                <div className="space-y-4">
                  <Card className="relative overflow-hidden border-none bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 text-white shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Stethoscope className="w-24 h-24" />
                    </div>
                    <CardContent className="p-5">
                      <Badge className="mb-3 border-none bg-white/18 text-white">Fast scan</Badge>
                      <h3 className="mb-1 text-lg font-semibold">AI Infection Scan</h3>
                      <p className="mb-4 text-sm text-blue-50">Upload a photo for instant detection and prevention tips.</p>
                      <Button 
                        variant="secondary" 
                        className="h-11 w-full rounded-2xl bg-white text-blue-600 hover:bg-blue-50"
                        onClick={() => setView('scan')}
                      >
                        <Camera className="w-4 h-4 mr-2" />
                        Start Scanning
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="relative overflow-hidden border-none bg-slate-950 text-white shadow-lg">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                      <Bot className="w-24 h-24" />
                    </div>
                    <CardContent className="p-5">
                      <Badge className="mb-3 border-none bg-white/10 text-white">Always on</Badge>
                      <h3 className="mb-1 text-lg font-semibold">AI Dental Assistant</h3>
                      <p className="mb-4 text-sm text-slate-300">Chat with our AI for quick dental advice and hygiene tips.</p>
                      <Button 
                        variant="secondary" 
                        className="h-11 w-full rounded-2xl border-none bg-blue-600 text-white hover:bg-blue-700"
                        onClick={() => setView('ai-chat')}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat with AI
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Specialized Features Section */}
                  <div className="space-y-3 pt-2">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      Specialized Features
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => setView('brushing-tracker')}
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
                      >
                        <div className="p-2 rounded-xl bg-pink-50 text-pink-500 w-fit mb-3 group-hover:scale-110 transition-transform">
                          <Activity className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">Kids Tracker</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Brush DJ & Rewards</p>
                      </button>
                      
                      <button 
                        onClick={() => setView('ortho-monitoring')}
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group"
                      >
                        <div className="p-2 rounded-xl bg-purple-50 text-purple-500 w-fit mb-3 group-hover:scale-110 transition-transform">
                          <Eye className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-bold text-slate-800">Ortho Monitor</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">AI Progress Tracking</p>
                      </button>

                      <button 
                        onClick={() => setView('tele-consultation')}
                        className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all text-left group col-span-2 flex items-center gap-4"
                      >
                        <div className="p-2 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-110 transition-transform">
                          <Video className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Teledentistry Hub</p>
                          <p className="text-[10px] text-slate-400">Secure Video consultation</p>
                        </div>
                        <ChevronRight className="ml-auto w-4 h-4 text-slate-300" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <Input 
                        placeholder="Search name, specialty, or hospital" 
                        className="h-12 rounded-2xl bg-slate-50 border-none pl-10 focus:ring-blue-500 shadow-md transition-all focus:bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={hospitalFilter} onValueChange={(v) => v && setHospitalFilter(v)}>
                      <SelectTrigger className="w-12 h-12 rounded-2xl bg-white border border-slate-100 p-0 flex items-center justify-center text-slate-600 shadow-sm hover:border-blue-200 hover:text-blue-600 transition-all">
                        <SlidersHorizontal className="w-5 h-5" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-slate-100 shadow-2xl">
                        <SelectItem value="all">All Hospitals</SelectItem>
                        {Array.from(new Set(doctors.map(d => d.clinicName))).sort().map(uni => (
                          <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="relative">
                    <ScrollArea className="w-full whitespace-nowrap pb-2">
                      <div className="flex gap-2 px-1">
                        <Button
                          variant={hospitalFilter === 'all' ? 'default' : 'outline'}
                          size="sm"
                          className={`rounded-full px-4 h-8 text-xs font-medium transition-all ${hospitalFilter === 'all' ? 'bg-blue-600 shadow-md' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                          onClick={() => setHospitalFilter('all')}
                        >
                          All Specialists
                        </Button>
                        {Array.from(new Set(doctors.map(d => d.clinicName))).slice(0, 8).map(uni => (
                          <Button
                            key={uni}
                            variant={hospitalFilter === uni ? 'default' : 'outline'}
                            size="sm"
                            className={`rounded-full px-4 h-8 text-xs font-medium transition-all ${hospitalFilter === uni ? 'bg-blue-600 shadow-md' : 'border-slate-200 text-slate-600 hover:border-blue-200'}`}
                            onClick={() => setHospitalFilter(uni)}
                          >
                            <Building className="w-3 h-3 mr-1.5" />
                            {uni.split(',')[0]}
                          </Button>
                        ))}
                      </div>
                    </ScrollArea>
                    <div className="absolute right-0 top-0 bottom-2 w-8 bg-gradient-to-l from-white pointer-events-none" />
                  </div>

                  {(hospitalFilter !== 'all' || searchQuery !== '') && (
                    <div className="flex items-center justify-between px-1">
                      <div className="flex flex-wrap gap-2">
                        {hospitalFilter !== 'all' && (
                          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-none px-3 py-1 flex items-center gap-2 rounded-lg">
                            <Building className="w-3 h-3" />
                            {hospitalFilter.split(',')[0]}
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setHospitalFilter('all')} />
                          </Badge>
                        )}
                        {searchQuery !== '' && (
                          <Badge className="bg-slate-50 text-slate-700 hover:bg-slate-100 border-none px-3 py-1 flex items-center gap-2 rounded-lg">
                            "{searchQuery}"
                            <X className="w-3 h-3 cursor-pointer" onClick={() => setSearchQuery('')} />
                          </Badge>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-[10px] h-6 text-slate-400 hover:text-blue-600"
                        onClick={() => { setHospitalFilter('all'); setSearchQuery(''); }}
                      >
                        Reset All
                      </Button>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <h2 className="text-xl font-bold tracking-tight text-slate-900">Top Specialists</h2>
                    <div className="flex items-center gap-2">
                       <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
                        <SelectTrigger className="h-8 text-[10px] rounded-full border-slate-200 bg-white/50 px-3 hover:bg-white transition-all w-fit gap-1">
                          <SlidersHorizontal className="w-3 h-3 mr-1" />
                          Sort by: <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="rating">Top Rated</SelectItem>
                          <SelectItem value="experience">Most Experience</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="link" 
                        className="h-8 rounded-full bg-blue-50/50 px-3 text-xs font-semibold text-blue-600 no-underline hover:bg-blue-100/50 hover:no-underline transition-all"
                        onClick={() => setShowAllDoctors(!showAllDoctors)}
                      >
                        {showAllDoctors ? 'Show less' : 'See all'}
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-4 pb-8">
                    {filteredDoctors.length > 0 ? (
                      filteredDoctors.slice(0, showAllDoctors ? undefined : 3).map((doc) => (
                        <Card 
                          key={doc.id} 
                          className="group relative h-full cursor-pointer border-none bg-white p-1 ring-1 ring-slate-100 shadow-sm transition-all hover:shadow-xl hover:shadow-blue-500/10 hover:ring-blue-100"
                          onClick={() => { setSelectedDoctor(doc); setView('doctor-profile'); }}
                        >
                          <CardContent className="flex h-full items-center gap-4 p-4">
                            <div className="relative">
                              <Avatar className="h-16 w-16 rounded-2xl shadow-inner group-hover:scale-105 transition-transform">
                                <AvatarImage src={doc.avatar} />
                                <AvatarFallback>{doc.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500 text-white shadow-lg border-2 border-white">
                                <Check className="h-3.5 w-3.5" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <h4 className="font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">{doc.name}</h4>
                                <Badge className="bg-yellow-50 text-yellow-700 text-[10px] px-1.5 py-0 border-none ml-2">
                                  <Star className="w-3 h-3 mr-1 fill-yellow-500 text-yellow-500" />
                                  {doc.rating}
                                </Badge>
                              </div>
                              <p className="text-xs text-slate-500 font-medium">{doc.specialization}</p>
                              
                                <div className="flex items-center gap-1.5 text-xs text-blue-600 font-semibold mt-1">
                                  <Building className="w-4 h-4" />
                                  <span className="truncate">{doc.clinicName}</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center justify-center h-full gap-2">
                              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                <ChevronRight className="w-5 h-5" />
                              </div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{doc.experience.split(' ')[0]} Yrs</p>
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center">
                          <Search className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">No doctors found</h3>
                          <p className="text-sm text-slate-500 max-w-[200px] mx-auto mt-1">Try adjusting your filters or search query to find more specialists.</p>
                        </div>
                        <Button 
                          variant="outline" 
                          className="rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50"
                          onClick={() => { setHospitalFilter('all'); setSearchQuery(''); }}
                        >
                          Clear all filters
                        </Button>
                      </div>
                    )}
                  </div>
                  </div>
                </div>
            )}

            {view === 'ai-chat' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <div className="flex h-full flex-col">
                  <div className="flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3">
                    {aiQuickPrompts.map((prompt) => (
                      <Button
                        key={prompt.label}
                        variant="outline"
                        size="sm"
                        className="rounded-full border-slate-200 bg-white text-xs"
                        onClick={() => sendAIMessage(prompt.prompt)}
                      >
                        {prompt.label}
                      </Button>
                    ))}
                  </div>
                  <div className="min-h-0 flex-1">
                    <ChatWindow 
                      messages={aiMessages}
                      onSendMessage={sendAIMessage}
                      otherPartyName="Dental AI Assistant"
                      myId="me"
                      onBack={() => setView('home')}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {view === 'doctor-profile' && (
              !selectedDoctor ? (
                <div className="flex h-full flex-col items-center justify-center bg-white p-4">
                  <p className="text-slate-500 mb-4 font-medium">Doctor details not found</p>
                  <Button 
                    className="rounded-full bg-blue-600 px-8"
                    onClick={() => setView('home')}
                  >
                    Go Back Home
                  </Button>
                </div>
              ) : (
                <motion.div 
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                className="flex h-full flex-col overflow-hidden bg-slate-50"
              >
                {/* Header with Gradient Background */}
                <div className="relative h-48 w-full bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                  <div className="relative flex items-center justify-between p-4 pt-12 text-white">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                      onClick={() => setView('home')}
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h2 className="text-lg font-bold">Specialist Profile</h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full bg-white/20 text-white backdrop-blur-md hover:bg-white/30"
                      onClick={() => toast.info(`${selectedDoctor.name} added to favorites`)}
                    >
                      <Star className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Profile Card Overlay */}
                <div className="relative -mt-16 flex flex-1 flex-col rounded-t-[2.5rem] bg-white px-5 pt-0 shadow-2xl overflow-hidden">
                  <div className="flex flex-col items-center -mt-12 space-y-4">
                    <div className="relative">
                      <Avatar className="h-28 w-28 border-4 border-white shadow-2xl">
                        <AvatarImage src={selectedDoctor.avatar} className="object-cover" />
                        <AvatarFallback className="bg-blue-100 text-blue-600 text-2xl font-bold">{selectedDoctor.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="absolute bottom-1 right-1 h-6 w-6 rounded-lg bg-emerald-500 border-2 border-white flex items-center justify-center text-white shadow-lg">
                        <Check className="w-3 h-3" />
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <h2 className="text-2xl font-bold text-slate-900">{selectedDoctor.name}</h2>
                      <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-1">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none px-3">{selectedDoctor.specialization}</Badge>
                        <span className="text-slate-300">|</span>
                        <div className="flex items-center gap-1 font-medium">
                          <Building className="w-4 h-4 text-blue-500" />
                          {selectedDoctor.clinicName}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 py-4">
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Experience</p>
                      <p className="text-lg font-bold text-blue-600">{selectedDoctor.experience}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Rating</p>
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <p className="text-lg font-bold text-slate-900">{selectedDoctor.rating}</p>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Reviews</p>
                      <p className="text-lg font-bold text-slate-900">120+</p>
                    </div>
                  </div>

                  <div className="flex-1 space-y-6 overflow-y-auto pt-6 pb-28">
                    <section>
                      <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Info className="w-4 h-4 text-blue-500" />
                        Professional Bio
                      </h3>
                      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 italic">
                        "{selectedDoctor.bio}"
                      </p>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Building className="w-4 h-4 text-blue-500" />
                        Hospital Affiliation
                      </h3>
                      <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm">
                        <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Building className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col justify-center">
                          <p className="text-xs font-bold text-slate-900">{selectedDoctor.clinicName}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Primary Care Center</p>
                        </div>
                      </div>
                    </section>

                    <section>
                      <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        Available Slots
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedDoctor.availableSlots.slice(0, 4).map((slot, idx) => (
                          <Badge key={slot || `slot-${idx}`} variant="outline" className="border-blue-100 text-blue-600 bg-blue-50/50 py-1.5 px-3 rounded-xl font-medium">
                            {slot}
                          </Badge>
                        ))}
                        <Badge variant="outline" className="border-slate-100 text-slate-400 py-1.5 px-3 rounded-xl font-medium">+ Many more</Badge>
                      </div>
                    </section>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-slate-100 p-5 flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-14 rounded-2xl border-blue-200 text-blue-600 font-bold hover:bg-blue-50 transition-all active:scale-95"
                      onClick={() => openDoctorChat(selectedDoctor)}
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Chat
                    </Button>
                    <Button 
                      className="flex-[1.5] h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xl shadow-blue-200 transition-all active:scale-95"
                      onClick={() => setIsBookingModalOpen(true)}
                    >
                      <Calendar className="w-5 h-5 mr-2" />
                      Book Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {view === 'chat' && role === 'patient' && selectedDoctor && selectedPatient && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <ChatWindow
                  messages={selectedPatient.messages}
                  onSendMessage={(text) => sendMessage(text, selectedDoctor.id)}
                  otherPartyName={selectedDoctor.name}
                  myId="me"
                  onBack={() => setView('doctor-profile')}
                />
              </motion.div>
            )}

            {view === 'history' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col space-y-6 overflow-y-auto px-4 pb-28 pt-20 md:px-5"
              >
                <header className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" onClick={() => setView('home')}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold">My Medical History</h2>
                </header>
                <div className="pb-24">
                  <MedicalHistory 
                    patient={doctors[0].patients.find(p => p.name === 'Alice Johnson') || doctors[0].patients[0]} 
                    onViewChange={setView}
                  />
                </div>
              </motion.div>
            )}

            {view === 'brushing-tracker' && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="flex-1"
              >
                <KidsBrushingTracker onBack={() => setView('home')} />
              </motion.div>
            )}

            {view === 'ortho-monitoring' && (
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                className="flex-1"
              >
                <OrthoMonitoring 
                    onBack={() => setView('home')} 
                    onCaptureScan={(img) => {
                        setScanImage(img);
                        setIsScanning(true);
                        analyzeDentalInfection(img).then(setScanResult).finally(() => setIsScanning(false));
                    }}
                />
              </motion.div>
            )}

            {view === 'tele-consultation' && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="flex-1"
              >
                <TeleConsultation onBack={() => setView('home')} doctorName={selectedDoctor?.name || "Dr. Arul Selvan"} />
              </motion.div>
            )}

            {view === 'scan' && (
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="flex h-full flex-col overflow-y-auto bg-white px-4 pb-28 pt-20 md:px-5"
              >
                <header className="flex items-center gap-3 mb-8">
                  <Button variant="ghost" size="icon" onClick={() => setView('home')}>
                    <ArrowLeft className="w-5 h-5" />
                  </Button>
                  <h2 className="text-xl font-bold">Infection Detection</h2>
                </header>

                {!scanResult ? (
                  <div className="flex flex-1 flex-col items-center justify-center space-y-6">
                    <div className="relative flex aspect-square w-full max-w-[18rem] flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-blue-200 bg-blue-50/60">
                      {isScanning ? (
                        <div className="relative w-full h-full flex flex-col items-center justify-center">
                          {scanImage && (
                            <motion.img 
                              initial={{ opacity: 0, scale: 1.1 }}
                              animate={{ opacity: 0.6, scale: 1 }}
                              src={scanImage} 
                              className="absolute inset-0 w-full h-full object-cover blur-[1px]" 
                            />
                          )}
                          <div className="relative z-20 flex flex-col items-center space-y-4">
                            <motion.div 
                              animate={{ y: [0, 240, 0] }}
                              transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                              className="absolute top-[-40px] left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] z-30"
                            />
                            <div className="p-4 rounded-full bg-white/40 backdrop-blur-md shadow-xl">
                              <Activity className="w-12 h-12 text-blue-600 animate-pulse" />
                            </div>
                            <p className="text-blue-700 font-bold animate-pulse text-lg drop-shadow-md">Analyzing...</p>
                          </div>
                          <div className="absolute inset-0 bg-blue-500/10 pointer-events-none z-10" />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center space-y-4 text-center p-6">
                          <Camera className="w-12 h-12 text-blue-400" />
                          <p className="text-sm text-slate-500">Take a clear photo of the affected area</p>
                          <div className="flex gap-2 w-full max-w-[200px]">
                            <Button 
                              className="flex-1 bg-blue-600 hover:bg-blue-700 h-10 text-xs rounded-xl"
                              onClick={() => setIsCameraOpen(true)}
                            >
                              Take Photo
                            </Button>
                            <label htmlFor="image-upload" className="flex-1 cursor-pointer">
                              <Button variant="outline" className="w-full h-10 text-xs rounded-xl pointer-events-none">Gallery (Max 2)</Button>
                            </label>
                          </div>
                          <input 
                            id="image-upload"
                            type="file" 
                            multiple
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleScan} 
                          />
                        </div>
                      )}
                    </div>
                    <div className="grid w-full grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <ShieldCheck className="w-5 h-5 text-green-600 mb-2" />
                        <p className="text-xs font-semibold">Privacy Protected</p>
                        <p className="text-[10px] text-slate-400">Your data is encrypted</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <Clock className="w-5 h-5 text-blue-600 mb-2" />
                        <p className="text-xs font-semibold">Instant Result</p>
                        <p className="text-[10px] text-slate-400">Powered by Gemini AI</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-8 pb-24">
                    {(() => {
                      const urgency = getScanUrgency(scanResult);

                      return (
                        <Card className="border-none bg-white shadow-sm">
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-blue-600">AI Triage</p>
                                <h3 className="mt-1 text-lg font-semibold text-slate-900">Instant urgency guidance</h3>
                              </div>
                              <Badge className={`border ${urgency.tone}`}>{urgency.label}</Badge>
                            </div>
                            <div className="mt-4 grid grid-cols-[96px_1fr] gap-4">
                              <div className="rounded-3xl bg-slate-950 p-4 text-center text-white">
                                <p className="text-[10px] uppercase tracking-wide text-slate-300">% of risk</p>
                                <p className="mt-1 text-3xl font-bold">{urgency.score}</p>
                                <p className="text-[10px] text-slate-300">AI risk</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-xs font-semibold text-slate-600">Recommended next steps</p>
                                {urgency.actions.map((action) => (
                                  <div key={action} className="flex gap-2 rounded-2xl bg-slate-50 p-3 text-xs text-slate-700">
                                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                                    <span>{action}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })()}

                    {/* Top Section: Image & Detection */}
                    <div className="space-y-6">
                      <div className="relative group">
                        <div className="absolute inset-0 bg-blue-600/10 rounded-3xl blur-xl group-hover:bg-blue-600/20 transition-all" />
                        <img 
                          src={scanResult.imageUrl} 
                          alt="Patient dental scan"
                          className="relative w-full aspect-square object-cover rounded-3xl shadow-2xl border-4 border-white z-10" 
                          referrerPolicy="no-referrer" 
                        />
                        <div className="absolute top-6 left-6 z-20">
                          <Badge className="bg-blue-600/90 backdrop-blur-md border-none px-3 py-1 text-[10px] uppercase tracking-wider font-bold shadow-lg">
                            Patient Scan
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-4">
                        <Card className="border-none shadow-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white h-full relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                          <CardHeader className="pb-2 relative z-10">
                            <CardTitle className="text-white flex items-center gap-2 text-lg">
                              <Activity className="w-5 h-5" />
                              AI Detection Result
                            </CardTitle>
                            <CardDescription className="text-blue-100 text-xs">
                              Analyzed by Gemini 1.5 Flash
                            </CardDescription>
                          </CardHeader>
                          <CardContent className="relative z-10 flex-1 flex items-center">
                            <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20 w-full">
                              <p className="text-blue-50 text-sm leading-relaxed font-medium italic">
                                "{scanResult.detection}"
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    {/* Prevention Tips Section */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                          <ShieldCheck className="w-5 h-5 text-green-600" />
                          Prevention & Care Tips
                        </h3>
                        <Badge variant="outline" className="text-[10px] border-green-100 text-green-600 bg-green-50">
                          {scanResult.prevention.length} Recommendations
                        </Badge>
                      </div>
                      <div className="space-y-3">
                        {scanResult.prevention.map((tip, i) => (
                          <motion.div 
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="flex gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-shadow group"
                          >
                            <div className="w-8 h-8 rounded-xl bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 group-hover:bg-green-600 group-hover:text-white transition-colors">
                              {i + 1}
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed">{tip}</p>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Patient Details Section */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-600" />
                        Patient Information
                      </h3>
                      <Card className="border-none bg-slate-50/50 backdrop-blur-sm border border-slate-100 shadow-inner">
                        <CardContent className="p-6 space-y-6">
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Full Name</label>
                              <Input 
                                placeholder="Enter patient name" 
                                value={patientName}
                                onChange={(e) => setPatientName(e.target.value)}
                                className="h-12 bg-white border-slate-200 rounded-2xl text-sm shadow-sm focus:ring-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Gender</label>
                              <Select value={patientGender} onValueChange={(v) => setPatientGender(v || 'Male')}>
                                <SelectTrigger className="h-12 bg-white border-slate-200 rounded-2xl text-sm shadow-sm focus:ring-blue-500">
                                  <SelectValue placeholder="Select Gender" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Male">Male</SelectItem>
                                  <SelectItem value="Female">Female</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Age</label>
                                <Input 
                                  type="number"
                                  placeholder="Age" 
                                  value={patientAge}
                                  onChange={(e) => setPatientAge(e.target.value)}
                                  className="h-12 bg-white border-slate-200 rounded-2xl text-sm shadow-sm focus:ring-blue-500"
                                />
                              </div>
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider ml-1">Mobile No</label>
                                <Input 
                                  placeholder="Mobile number" 
                                  value={patientMobile}
                                  onChange={(e) => setPatientMobile(e.target.value)}
                                  className="h-12 bg-white border-slate-200 rounded-2xl text-sm shadow-sm focus:ring-blue-500"
                                />
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 rounded-2xl bg-white border border-slate-200 p-4 shadow-sm">
                            <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                              <AvatarImage src={currentDoctor.avatar} />
                              <AvatarFallback>D</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-slate-900">{currentDoctor.name}</p>
                              <p className="text-[11px] text-slate-500">{currentDoctor.specialization}</p>
                            </div>
                            <Badge variant="secondary" className="border-none bg-blue-50 text-blue-700">
                              Suggested doctor
                            </Badge>
                          </div>
                          <Button
                            className="h-12 w-full rounded-2xl bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedDoctor(currentDoctor);
                              setIsBookingModalOpen(true);
                            }}
                          >
                            Book Consultation
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {view === 'nearby' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex h-full flex-col"
              >
                <LocationFeature 
                  doctors={doctors}
                  onBack={() => setView('home')}
                  onSelectDoctor={(doc) => {
                    setSelectedDoctor(doc);
                    setView('doctor-profile');
                  }}
                />
              </motion.div>
            )}

            {selectedDoctor && (
              <BookingModal 
                isOpen={isBookingModalOpen}
                onClose={() => setIsBookingModalOpen(false)}
                doctor={selectedDoctor}
                onConfirm={(booking) => handleAppointmentBooking(selectedDoctor.id, booking)}
                initialName={patientName}
                initialAge={patientAge}
                initialGender={patientGender}
                initialMobile={patientMobile}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="doctor-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-white"
          >
                {view === 'home' && (
                  <div className="flex h-full flex-col gap-5 overflow-y-auto px-4 pb-28 pt-20 md:px-5">
                    <header className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Select value={currentDoctorId} onValueChange={(v) => setCurrentDoctorId(v || doctors[0].id)}>
                            <SelectTrigger hideIcon className="h-auto w-auto border-none bg-transparent p-0 shadow-none focus:ring-0">
                              <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
                                {currentDoctor.name}
                                <ChevronDown className="size-4 text-slate-400" />
                              </h1>
                            </SelectTrigger>
                            <SelectContent className="border border-slate-200 bg-white text-slate-900 shadow-2xl">
                              <div className="p-2 border-b">
                                <Select value={hospitalFilter} onValueChange={(v) => v && setHospitalFilter(v)}>
                                  <SelectTrigger className="h-8 text-xs bg-slate-50 border-none">
                                    <SelectValue placeholder="Filter by Hospital" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Hospitals</SelectItem>
                                    {Array.from(new Set(doctors.map(d => d.clinicName))).sort().map(uni => (
                                      <SelectItem key={uni} value={uni}>{uni}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              {doctors
                                .filter(d => hospitalFilter === 'all' || d.clinicName === hospitalFilter)
                                .map(d => (
                                  <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                                ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <p className="text-sm text-slate-500">Dashboard Overview</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                          <AvatarImage src={currentDoctor.avatar} />
                          <AvatarFallback>D</AvatarFallback>
                        </Avatar>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={handleLogout}
                          className="rounded-full h-10 w-10 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <LogOut className="w-5 h-5" />
                        </Button>
                      </div>
                    </header>
                    <div className="flex-1 overflow-y-auto px-4 pt-4">
                      <div className="pb-24">
                        <Tabs value={doctorActiveTab} onValueChange={setDoctorActiveTab} className="w-full">
                          <TabsContent value="dashboard" className="space-y-6 mt-0">
                            {/* Tier 1: Real-time Stats */}
                            <div className="grid grid-cols-2 gap-3">
                              <Card className="border-none bg-gradient-to-br from-blue-600 to-blue-700 p-4 text-white shadow-lg overflow-hidden relative">
                                <div className="absolute -right-2 -top-2 opacity-10">
                                  <Users className="w-16 h-16" />
                                </div>
                                <p className="text-[10px] font-bold uppercase opacity-80 tracking-wider">Patients</p>
                                <p className="mt-1 text-2xl font-bold">{currentDoctor.patients.length}</p>
                                <div className="mt-2 text-[9px] bg-white/20 w-fit px-1.5 py-0.5 rounded-full backdrop-blur-md">
                                  +12% vs last month
                                </div>
                              </Card>
                              <Card className="border-none bg-white p-4 shadow-sm border border-slate-100 relative overflow-hidden">
                                <div className="absolute -right-2 -top-2 opacity-10 text-red-600">
                                  <Activity className="w-16 h-16" />
                                </div>
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Review Queue</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{pendingReviewsCount}</p>
                                <div className="mt-2 text-[9px] text-red-600 font-bold bg-red-50 w-fit px-1.5 py-0.5 rounded-full">
                                  {pendingReviewsCount > 0 ? 'Urgent reviews' : 'All clear'}
                                </div>
                              </Card>
                              <Card className="border-none bg-white p-4 shadow-sm border border-slate-100">
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Appointments</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">{todayAppointments}</p>
                                <p className="text-[10px] text-slate-500 mt-1">Today</p>
                              </Card>
                              <Card className="border-none bg-white p-4 shadow-sm border border-slate-100">
                                <p className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">Revenue</p>
                                <p className="mt-1 text-2xl font-bold text-slate-900">₹{(todayAppointments * 800).toLocaleString()}</p>
                                <p className="text-[10px] text-emerald-600 mt-1 font-medium">Est. Earnings</p>
                              </Card>
                            </div>

                            {/* Tier 2: Priority Clinical Queue */}
                            <div className="space-y-3">
                              <h3 className="text-sm font-bold flex items-center justify-between text-slate-700">
                                Clinical Priority Queue
                                <Badge variant="outline" className="text-[9px] h-5">{pendingReviewsCount} Pending</Badge>
                              </h3>
                              <div className="space-y-3">
                                {currentDoctor.patients
                                  .filter(p => p.infectionHistory.some(r => r.status === 'pending'))
                                  .slice(0, 3)
                                  .map(p => {
                                    const pendingScan = p.infectionHistory.find(r => r.status === 'pending');
                                    return (
                                      <Card key={p.id} className="border-none shadow-sm bg-white overflow-hidden hover:ring-1 hover:ring-blue-100 transition-all cursor-pointer" onClick={() => { setSelectedPatient(p); setView('patient-detail'); }}>
                                        <div className="p-3 flex items-center gap-3">
                                          <div className="relative">
                                            <Avatar className="w-12 h-12 rounded-xl">
                                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.name}`} />
                                              <AvatarFallback>{p.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center">
                                              <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            </div>
                                          </div>
                                          <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold truncate text-slate-900">{p.name}</h4>
                                            <p className="text-[10px] text-slate-500">{pendingScan?.date}</p>
                                            <p className="text-[10px] font-medium text-red-600 mt-0.5">{pendingScan?.detection}</p>
                                          </div>
                                          <Button variant="ghost" size="sm" className="text-[10px] h-7 px-2 bg-blue-50 text-blue-600 hover:bg-blue-100 border-none">
                                            Review
                                          </Button>
                                        </div>
                                      </Card>
                                    )
                                  }
                                )}
                                {pendingReviewsCount === 0 && (
                                  <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2 opacity-50" />
                                    <p className="text-xs text-slate-400">All scans have been reviewed</p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Tier 3: Today's Schedule */}
                            <div className="space-y-3">
                              <h3 className="text-sm font-bold text-slate-700">Today's Schedule</h3>
                              <div className="space-y-3">
                                {currentDoctor.appointments.filter(a => a.date === todayString).length > 0 ? (
                                  currentDoctor.appointments
                                    .filter(a => a.date === todayString)
                                    .sort((a,b) => a.time.localeCompare(b.time))
                                    .map((app) => (
                                      <div key={app.id} className="relative pl-10">
                                        <div className="absolute left-4 top-0 bottom-0 w-px bg-slate-100" />
                                        <div className="absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white bg-blue-600 shadow-sm shadow-blue-200" />
                                        <Card className="border-none shadow-sm bg-white p-3">
                                          <div className="flex justify-between items-start">
                                            <div>
                                              <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{app.time}</p>
                                              <h4 className="text-sm font-bold text-slate-900 mt-0.5">{app.patientName}</h4>
                                              <p className="text-[10px] text-slate-500">{app.type}</p>
                                            </div>
                                            <Badge variant="outline" className={`text-[9px] ${app.status === 'upcoming' ? 'border-blue-100 text-blue-600' : 'border-slate-100 text-slate-400'}`}>
                                              {app.status}
                                            </Badge>
                                          </div>
                                        </Card>
                                      </div>
                                    ))
                                ) : (
                                  <div className="text-center py-6 text-slate-400">
                                     <p className="text-xs italic">No appointments for today</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </TabsContent>

                          <TabsContent value="patients" className="mt-0">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-sm font-medium text-slate-500">Patient List</h3>
                              <div className="flex gap-2">
                                <Select value={genderFilter} onValueChange={(v) => setGenderFilter(v || 'all')}>
                                  <SelectTrigger className="w-[100px] h-8 text-xs rounded-lg bg-white border-none shadow-sm">
                                    <SelectValue placeholder="Gender" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All</SelectItem>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                  </SelectContent>
                                </Select>
                                <Select value={dateFilter} onValueChange={(v) => setDateFilter(v || 'all')}>
                                  <SelectTrigger className="w-[100px] h-8 text-xs rounded-lg bg-white border-none shadow-sm">
                                    <SelectValue placeholder="Date" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="all">All Time</SelectItem>
                                    <SelectItem value="today">Today</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            <div className="space-y-3">
                              {currentDoctor.patients
                                .filter(p => {
                                  const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
                                  const matchesDate = dateFilter === 'all' || currentDoctor.appointments.some(a => a.patientId === p.id && a.date === todayString);
                                  return matchesGender && matchesDate;
                                })
                                .map((patient) => (
                                <Card key={patient.id} className="border-none shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setSelectedPatient(patient); setView('patient-detail'); }}>
                                  <CardContent className="p-4 flex items-center gap-4 h-full">
                                    <Avatar className="w-10 h-10 rounded-xl">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                                      <AvatarFallback>{patient.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <h4 className="font-semibold text-sm">{patient.name}</h4>
                                      <p className="text-[10px] text-slate-500">Last visit: {patient.lastVisit}</p>
                                    </div>
                                    <Badge variant="outline" className="text-[10px]">{patient.age}y • {patient.gender}</Badge>
                                  </CardContent>
                                </Card>
                              ))}
                              {currentDoctor.patients.length === 0 && (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                  <Users className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                                  <p className="text-sm text-slate-400">No patients yet</p>
                                </div>
                              )}
                              {dateFilter === 'today' && currentDoctor.patients.length > 0 && currentDoctor.patients.filter(p => currentDoctor.appointments.some(a => a.patientId === p.id && a.date === todayString)).length === 0 && (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                  <Calendar className="w-10 h-10 mx-auto text-slate-300 mb-2 opacity-50" />
                                  <p className="text-sm text-slate-400">No bookings for today</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          <TabsContent value="messages" className="mt-0">
                            <div className="space-y-3 pb-20">
                              {currentDoctor.patients.filter(p => p.messages.length > 0).map((patient) => (
                                <Card key={patient.id} className="cursor-pointer border-none shadow-sm" onClick={() => { setSelectedPatient(patient); setView('chat'); }}>
                                  <CardContent className="p-4 flex items-center gap-4">
                                    <Avatar className="w-10 h-10 rounded-xl">
                                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${patient.name}`} />
                                      <AvatarFallback>{patient.name[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                        <h4 className="font-semibold text-sm">{patient.name}</h4>
                                        <span className="text-[10px] text-slate-400">{patient.messages[patient.messages.length - 1].timestamp}</span>
                                      </div>
                                      <p className="text-[10px] text-slate-500 truncate">{patient.messages[patient.messages.length - 1].text}</p>
                                    </div>
                                    <div className="w-2 h-2 bg-blue-600 rounded-full" />
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </TabsContent>
                          <TabsContent value="appointments" className="mt-0">
                            <div className="space-y-3 pb-20">
                              <h3 className="text-sm font-medium text-slate-500 mb-2">All Appointments</h3>
                              {currentDoctor.appointments.length > 0 ? (
                                currentDoctor.appointments.map(app => (
                                  <div key={app.id} className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-3">
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                          <p className="font-semibold text-sm">{app.patientName}</p>
                                          <span className="text-[10px] text-slate-400">{app.date} • {app.time}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1">{app.type}</p>
                                        <Badge className="mt-2 text-[10px] uppercase tracking-wide">{app.status}</Badge>
                                      </div>
                                    </div>
                                    {app.status === 'upcoming' && (
                                      <div className="flex gap-2 pt-2 border-t border-slate-200">
                                        <Button 
                                          size="sm" 
                                          className="flex-1 h-8 text-[10px] bg-green-600 hover:bg-green-700"
                                          onClick={() => handleAppointmentAction(currentDoctor.id, app.patientId, app.id, 'approved')}
                                        >
                                          Approve
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          className="flex-1 h-8 text-[10px]"
                                          onClick={() => handleAppointmentAction(currentDoctor.id, app.patientId, app.id, 'rescheduled')}
                                        >
                                          Reschedule
                                        </Button>
                                        <Button 
                                          size="sm" 
                                          variant="destructive"
                                          className="flex-1 h-8 text-[10px]"
                                          onClick={() => {
                                            setAppointmentToCancel({ doctorId: currentDoctor.id, patientId: app.patientId, appointmentId: app.id });
                                            setIsCancelModalOpen(true);
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <div className="text-center py-10 opacity-50">
                                  <CalendarClock className="w-10 h-10 mx-auto mb-2 text-slate-400" />
                                  <p className="text-sm">No appointments scheduled</p>
                                </div>
                              )}
                            </div>
                          </TabsContent>
                          
                          <TabsContent value="team" className="mt-0">
                            <InternalCommunicator />
                          </TabsContent>

                          <TabsContent value="education" className="mt-0">
                            <EducationHub onBack={() => setDoctorActiveTab('dashboard')} />
                          </TabsContent>
                        </Tabs>
                      </div>
                    </div>
                  </div>
                )}

                {view === 'patient-detail' && selectedPatient && (
                  <motion.div 
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    className="flex h-full flex-col overflow-hidden bg-white"
                  >
                    <div className="flex items-center gap-4 border-b p-4 pt-20">
                      <Button variant="ghost" size="icon" onClick={() => setView('home')}>
                        <ArrowLeft className="w-5 h-5" />
                      </Button>
                      <h2 className="text-xl font-bold">Patient Details</h2>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                      <div className="space-y-8 pb-24">
                        <div className="flex items-center gap-4">
                          <Avatar className="w-20 h-20">
                            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${selectedPatient.name}`} />
                            <AvatarFallback>{selectedPatient.name[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-2xl font-bold">{selectedPatient.name}</h3>
                            <div className="flex gap-2 mt-1">
                              <Badge variant="secondary">{selectedPatient.age} years</Badge>
                              <Badge variant="secondary">{selectedPatient.gender}</Badge>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-blue-600" />
                            Appointment History
                          </h4>
                          <div className="space-y-3">
                            {currentDoctor.appointments.filter(a => a.patientId === selectedPatient.id).map(app => (
                              <div key={app.id} className="p-4 rounded-2xl bg-slate-50 flex flex-col gap-3">
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm">{app.type}</p>
                                    <p className="text-xs text-slate-500">{app.date} • {app.time}</p>
                                    <Badge className="mt-2 text-[10px] uppercase tracking-wide">{app.status}</Badge>
                                  </div>
                                </div>
                                {app.status === 'upcoming' && (
                                  <div className="flex gap-2 pt-2 border-t border-slate-200">
                                    <Button 
                                      size="sm" 
                                      className="flex-1 h-8 text-[10px] bg-green-600 hover:bg-green-700"
                                      onClick={() => handleAppointmentAction(currentDoctor.id, selectedPatient.id, app.id, 'approved')}
                                    >
                                      Approve
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="outline"
                                      className="flex-1 h-8 text-[10px]"
                                      onClick={() => handleAppointmentAction(currentDoctor.id, selectedPatient.id, app.id, 'rescheduled')}
                                    >
                                      Reschedule
                                    </Button>
                                    <Button 
                                      size="sm" 
                                      variant="destructive"
                                      className="flex-1 h-8 text-[10px]"
                                      onClick={() => {
                                        setAppointmentToCancel({ doctorId: currentDoctor.id, patientId: selectedPatient.id, appointmentId: app.id });
                                        setIsCancelModalOpen(true);
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-4">
                          <h4 className="font-semibold flex items-center gap-2">
                            <ClipboardList className="w-5 h-5 text-blue-600" />
                            Clinical Notes
                          </h4>
                          <MedicalHistory 
                            patient={selectedPatient} 
                            onViewChange={setView}
                          />
                        </div>
                        <Button className="w-full h-12 rounded-xl bg-blue-600" onClick={() => setView('chat')}>
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Open Chat
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {view === 'chat' && selectedPatient && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex-1"
                  >
                    <ChatWindow 
                      messages={selectedPatient.messages}
                      onSendMessage={(text) => sendMessage(text, selectedPatient.id, currentDoctor.id)}
                      otherPartyName={selectedPatient.name}
                      myId={currentDoctor.id}
                      onBack={() => setView('patient-detail')}
                    />
                  </motion.div>
                )}

                {/* --- DOCTOR BOTTOM NAV --- */}
                {view === 'home' && (
                  <div className="fixed bottom-0 left-1/2 right-auto z-40 w-full max-w-[480px] -translate-x-1/2 border-t border-slate-200 bg-white/90 p-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))] backdrop-blur-xl">
                    <div className="mx-auto flex w-full items-center justify-around">
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'dashboard' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('dashboard')}
                      >
                        <Activity className="w-5 h-5" />
                        <span className="text-[10px]">Dashboard</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'patients' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('patients')}
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-[10px]">Patients</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'team' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('team')}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px]">Team</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'education' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('education')}
                      >
                        <GraduationCap className="w-5 h-5" />
                        <span className="text-[10px]">Edu</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'appointments' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('appointments')}
                      >
                        <CalendarClock className="w-5 h-5" />
                        <span className="text-[10px]">Visits</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'patients' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('patients')}
                      >
                        <Users className="w-5 h-5" />
                        <span className="text-[10px]">Patients</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'messages' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('messages')}
                      >
                        <MessageSquare className="w-5 h-5" />
                        <span className="text-[10px]">Messages</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'appointments' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('appointments')}
                      >
                        <CalendarClock className="w-5 h-5" />
                        <span className="text-[10px]">Appts</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        className={`flex flex-col gap-1 h-auto py-2 ${doctorActiveTab === 'availability' ? 'text-blue-600' : 'text-slate-400'}`}
                        onClick={() => setDoctorActiveTab('availability')}
                      >
                        <Clock className="w-5 h-5" />
                        <span className="text-[10px]">Slots</span>
                      </Button>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          }
        </AnimatePresence>
        <CameraModal 
          isOpen={isCameraOpen}
          onClose={() => setIsCameraOpen(false)}
          onCapture={processCameraCapture}
        />
        <CancelAppointmentModal 
          isOpen={isCancelModalOpen}
          onClose={() => {
            setIsCancelModalOpen(false);
            setAppointmentToCancel(null);
          }}
          onConfirm={(reason) => {
            if (appointmentToCancel) {
              handleAppointmentAction(appointmentToCancel.doctorId, appointmentToCancel.patientId, appointmentToCancel.appointmentId, 'cancelled', reason);
            }
            setIsCancelModalOpen(false);
            setAppointmentToCancel(null);
          }}
        />
      </div>
  );
}




