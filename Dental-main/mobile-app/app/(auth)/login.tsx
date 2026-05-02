import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, Alert } from 'react-native';
import { MotiView, AnimatePresence } from 'moti'; 
import { User, Stethoscope, ArrowRight, Lock, Mail, ChevronLeft, IdCard } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Input } from '../../src/components/ui/Input';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Role } from '../../src/types';
import { DEMO_CREDENTIALS, signIn, signUp, ensureAuthSeeded } from '../../src/services/authService';
import { useRouter } from 'expo-router';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<'selection' | 'form'>('selection');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [isLoading, setIsLoading] = useState(false);
  
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    ensureAuthSeeded();
  }, []);

  const handleRoleSelect = (role: Role) => {
    setSelectedRole(role);
    setAuthMode('signin');
    setStep('form');
  };

  const handleSubmit = async () => {
    if (!selectedRole) return;

    if (authMode === 'signup' && !fullName.trim()) {
      Alert.alert('Error', 'Please enter your name.');
      return;
    }

    if (authMode === 'signup' && password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const result = authMode === 'signin' 
        ? await signIn({ email, password, role: selectedRole })
        : await signUp({ name: fullName, email, password, role: selectedRole });

      if (result.ok) {
        // Navigate to tabs
        router.replace('/(tabs)');
      } else {
        Alert.alert('Login Failed', result.message);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  const currentDemoCredentials = DEMO_CREDENTIALS.find(c => c.role === selectedRole) || DEMO_CREDENTIALS[0];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-50"
    >
      <View className="flex-1 p-6 justify-center">
        {/* Background Blobs (Simplified for Native) */}
        <View className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-blue-100/50" />
        <View className="absolute -right-20 -bottom-20 w-80 h-80 rounded-full bg-cyan-100/50" />

        <View className="items-center mb-10">
          <View className="w-20 h-20 bg-blue-600 rounded-3xl items-center justify-center shadow-lg shadow-blue-500/50">
             <Stethoscope color="white" size={40} />
          </View>
          <Text className="text-3xl font-bold mt-4 text-slate-950">Alpha Dent</Text>
          <Text className="text-sm text-slate-500 mt-1">Modern Dental Care Powered by AI</Text>
        </View>

        {step === 'selection' ? (
          <View className="space-y-4">
            <Text className="text-lg font-semibold text-slate-800 text-center mb-4">
              Welcome! Please select your role
            </Text>
            
            <TouchableOpacity 
              onPress={() => handleRoleSelect('patient')}
              className="bg-white p-6 rounded-[2.5rem] flex-row items-center border border-slate-100 shadow-sm"
            >
              <View className="w-12 h-12 bg-blue-600 rounded-2xl items-center justify-center">
                <User color="white" size={24} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-slate-900">Patient</Text>
                <Text className="text-xs text-slate-500">View history & book visits</Text>
              </View>
              <ArrowRight color="#94a3b8" size={20} />
            </TouchableOpacity>

            <TouchableOpacity 
              onPress={() => handleRoleSelect('doctor')}
              className="bg-white p-6 rounded-[2.5rem] flex-row items-center border border-slate-100 shadow-sm"
            >
              <View className="w-12 h-12 bg-slate-900 rounded-2xl items-center justify-center">
                <Stethoscope color="white" size={24} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="text-lg font-bold text-slate-900">Doctor</Text>
                <Text className="text-xs text-slate-500">Manage patients & scans</Text>
              </View>
              <ArrowRight color="#94a3b8" size={20} />
            </TouchableOpacity>
          </View>
        ) : (
          <Card className="rounded-[2.5rem]">
            <CardContent className="p-8">
              <TouchableOpacity 
                onPress={() => setStep('selection')}
                className="flex-row items-center mb-6"
              >
                <ChevronLeft color="#64748b" size={16} />
                <Text className="text-slate-500 font-medium ml-1">Back</Text>
              </TouchableOpacity>

              <View className="flex-row bg-slate-100 p-1 rounded-2xl mb-6">
                 <TouchableOpacity 
                  onPress={() => setAuthMode('signin')}
                  className={`flex-1 py-2 rounded-xl items-center ${authMode === 'signin' ? 'bg-white shadow-sm' : ''}`}
                 >
                   <Text className={`font-semibold ${authMode === 'signin' ? 'text-slate-950' : 'text-slate-500'}`}>Sign In</Text>
                 </TouchableOpacity>
                 <TouchableOpacity 
                  onPress={() => setAuthMode('signup')}
                  className={`flex-1 py-2 rounded-xl items-center ${authMode === 'signup' ? 'bg-white shadow-sm' : ''}`}
                 >
                   <Text className={`font-semibold ${authMode === 'signup' ? 'text-slate-950' : 'text-slate-500'}`}>Sign Up</Text>
                 </TouchableOpacity>
              </View>

              <Text className="text-2xl font-bold text-slate-950 mb-1">
                {authMode === 'signin' ? 'Sign In' : 'Sign Up'}
              </Text>
              <Text className="text-sm text-slate-500 mb-6">
                Access as {selectedRole === 'patient' ? 'Patient' : 'Doctor'}
              </Text>

              <View className="space-y-4">
                {authMode === 'signup' && (
                  <Input 
                    label="Full Name"
                    placeholder="John Doe"
                    value={fullName}
                    onChangeText={setFullName}
                    icon={<IdCard color="#94a3b8" size={18} />}
                  />
                )}

                <Input 
                  label="Email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                  icon={<Mail color="#94a3b8" size={18} />}
                />

                <Input 
                  label="Password"
                  placeholder="••••••••"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  icon={<Lock color="#94a3b8" size={18} />}
                />

                {authMode === 'signup' && (
                  <Input 
                    label="Confirm Password"
                    placeholder="••••••••"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    icon={<Lock color="#94a3b8" size={18} />}
                  />
                )}

                <Button 
                  onPress={handleSubmit}
                  loading={isLoading}
                  title={authMode === 'signin' ? 'Sign In' : 'Create Account'}
                  variant={selectedRole === 'patient' ? 'primary' : 'secondary'}
                  className="mt-4"
                />

                {authMode === 'signin' && (
                  <View className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                    <Text className="text-blue-900 font-bold text-xs uppercase mb-1">Demo Credentials</Text>
                    <Text className="text-blue-700 text-xs">User: {currentDemoCredentials.email}</Text>
                    <Text className="text-blue-700 text-xs">Pass: {currentDemoCredentials.password}</Text>
                  </View>
                )}
              </View>
            </CardContent>
          </Card>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}
