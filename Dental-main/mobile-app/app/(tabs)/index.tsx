import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { 
  User, 
  Stethoscope, 
  Activity, 
  History, 
  Calendar, 
  ChevronRight, 
  Plus, 
  Bell, 
  Settings,
  ShieldCheck,
  Clock,
  CheckCircle2
} from 'lucide-react-native';
import { Card, CardContent } from '../../src/components/ui/Card';
// Badge is not available in react-native, using custom styled View below
import { Role, Patient, HealthMetric, Treatment, Appointment } from '../../src/types';
import { getAuthSession, clearAuthSession } from '../../src/services/authService';
import { DUMMY_DOCTORS } from '../../src/data/data';
import { format } from 'date-fns';

export default function Dashboard() {
  const router = useRouter();
  const [role, setRole] = useState<Role>('patient');
  const [userName, setUserName] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [patientData, setPatientData] = useState<Patient | null>(DUMMY_DOCTORS[0].patients[0]);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    const session = await getAuthSession();
    if (session) {
      setRole(session.role);
      setUserName(session.name);
    } else {
      router.replace('/(auth)/login');
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const handleLogout = async () => {
    await clearAuthSession();
    router.replace('/(auth)/login');
  };

  return (
    <View className="flex-1 bg-slate-50">
      <ScrollView 
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 40 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Header */}
        <View className="flex-row justify-between items-center mb-8 pt-8">
          <View>
            <Text className="text-slate-500 text-sm font-medium">Welcome back,</Text>
            <Text className="text-2xl font-bold text-slate-950">{userName || 'Surendhar'}</Text>
          </View>
          <View className="flex-row gap-3">
             <TouchableOpacity className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm">
                <Bell color="#64748b" size={20} />
             </TouchableOpacity>
             <TouchableOpacity 
              onPress={handleLogout}
              className="w-10 h-10 bg-white rounded-full items-center justify-center border border-slate-100 shadow-sm"
             >
                <Settings color="#64748b" size={20} />
             </TouchableOpacity>
          </View>
        </View>

        {role === 'patient' && patientData ? (
          <>
            {/* Health Metrics Grid */}
            <View className="flex-row gap-3 mb-8">
              {patientData.healthMetrics.map((metric) => (
                <View 
                  key={metric.id} 
                  className="flex-1 bg-white p-4 rounded-3xl items-center border border-slate-100 shadow-sm"
                >
                  <Text className="text-[10px] text-slate-400 font-bold uppercase mb-1">{metric.label}</Text>
                  <Text className={`text-sm font-bold ${
                    metric.status === 'good' ? 'text-green-600' : 
                    metric.status === 'average' ? 'text-yellow-600' : 'text-red-600'
                  }`}>{metric.value}</Text>
                </View>
              ))}
            </View>

            {/* Quick Actions / Appointments */}
            <View className="mb-8">
               <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-lg font-bold text-slate-900">Appointments</Text>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-semibold text-sm">View All</Text>
                  </TouchableOpacity>
               </View>
               
               {patientData.appointments.filter(a => a.status === 'upcoming').map(appt => (
                 <Card key={appt.id} className="mb-3 rounded-3xl border border-slate-100">
                    <CardContent className="p-4 flex-row items-center">
                       <View className="w-12 h-12 bg-blue-50 rounded-2xl items-center justify-center">
                          <Calendar color="#2563eb" size={20} />
                       </View>
                       <View className="ml-4 flex-1">
                          <Text className="text-sm font-bold text-slate-900">{appt.type}</Text>
                          <Text className="text-xs text-slate-500">{appt.date} • {appt.time}</Text>
                       </View>
                       <View className="bg-blue-100 px-3 py-1 rounded-full">
                          <Text className="text-[10px] font-bold text-blue-700">UPCOMING</Text>
                       </View>
                    </CardContent>
                 </Card>
               ))}
               
               <TouchableOpacity className="bg-blue-600 flex-row h-14 rounded-2xl items-center justify-center shadow-lg shadow-blue-500/40">
                  <Plus color="white" size={20} />
                  <Text className="text-white font-bold ml-2">Book Consultation</Text>
               </TouchableOpacity>
            </View>

            {/* Treatment History */}
            <View className="mb-8">
               <View className="flex-row justify-between items-center mb-4">
                  <View className="flex-row items-center">
                    <History color="#2563eb" size={20} />
                    <Text className="text-lg font-bold text-slate-900 ml-2">Medical History</Text>
                  </View>
               </View>

               <View className="space-y-4">
                  {patientData.treatmentHistory.map((t) => (
                    <Card key={t.id} className="rounded-3xl border border-slate-100">
                       <CardContent className="p-5">
                          <View className="flex-row justify-between mb-2">
                             <View>
                               <Text className="font-bold text-slate-800 text-base">{t.title}</Text>
                               <Text className="text-xs text-slate-500">{t.date} • {t.doctorName}</Text>
                             </View>
                             <View className="bg-green-50 px-2 py-1 rounded-lg">
                                <Text className="text-green-700 font-bold text-[10px]">{t.cost}</Text>
                             </View>
                          </View>
                          <Text className="text-xs text-slate-600 italic bg-slate-50 p-3 rounded-xl mb-3">
                            "{t.notes}"
                          </Text>
                          <View className="flex-row flex-wrap gap-1">
                             {t.prescriptions?.map((p, idx) => (
                               <View key={idx} className="border border-blue-100 bg-blue-50/50 px-2 py-0.5 rounded-md">
                                  <Text className="text-[9px] text-blue-600 font-medium">{p}</Text>
                               </View>
                             ))}
                          </View>
                       </CardContent>
                    </Card>
                  ))}
               </View>
            </View>

            {/* AI Scans History */}
            <View className="mb-8">
               <View className="flex-row items-center mb-4">
                  <Activity color="#ef4444" size={20} />
                  <Text className="text-lg font-bold text-slate-900 ml-2">AI Infection Scans</Text>
               </View>
               
               {patientData.infectionHistory.map(record => (
                 <Card key={record.id} className="mb-4 rounded-3xl border border-slate-100 overflow-hidden">
                    <Image 
                      source={{ uri: record.imageUrl }} 
                      className="w-full h-40" 
                      resizeMode="cover"
                    />
                    <CardContent className="p-4">
                       <View className="flex-row justify-between items-start mb-2">
                          <View className="flex-1 pr-4">
                             <Text className="text-[10px] font-bold text-blue-600 uppercase mb-1">AI Detection</Text>
                             <Text className="text-sm font-bold text-slate-800 leading-tight">"{record.detection}"</Text>
                          </View>
                          <View className="bg-slate-100 px-2 py-1 rounded-lg">
                             <Text className="text-slate-500 font-bold text-[9px]">{record.date}</Text>
                          </View>
                       </View>
                       <View className="flex-row flex-wrap gap-1.5 mt-2">
                          {record.prevention.map((p, i) => (
                            <View key={i} className="flex-row items-center bg-slate-50 px-2 py-1 rounded-lg">
                               <CheckCircle2 color="#22c55e" size={10} />
                               <Text className="text-[9px] text-slate-600 ml-1 font-medium">{p}</Text>
                            </View>
                          ))}
                       </View>
                    </CardContent>
                 </Card>
               ))}
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center py-20">
             <Stethoscope color="#cbd5e1" size={48} />
             <Text className="text-slate-400 mt-4 text-center">Select Patient mode to view metrics.</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}
