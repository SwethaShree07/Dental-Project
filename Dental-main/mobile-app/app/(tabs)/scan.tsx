import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, RefreshCcw, ShieldCheck, CheckCircle2, ChevronRight, Info } from 'lucide-react-native';
import { Button } from '../../src/components/ui/Button';
import { Card, CardContent } from '../../src/components/ui/Card';
import { analyzeDentalInfection } from '../../src/services/geminiService';
import { InfectionRecord } from '../../src/types';

export default function ScanScreen() {
  const [image, setImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<InfectionRecord | null>(null);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'We need access to your gallery to pick an image.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      setResult(null);
      
      // Auto-analyze if base64 is available
      if (result.assets[0].base64) {
        handleAnalyze(result.assets[0].base64);
      }
    }
  };

  const handleAnalyze = async (base64: string) => {
    setIsAnalyzing(true);
    try {
      const analysis = await analyzeDentalInfection(base64);
      setResult({
        id: Math.random().toString(),
        date: new Date().toLocaleDateString(),
        imageUrl: image!,
        detection: analysis.detection,
        prevention: analysis.prevention,
        status: 'pending'
      });
    } catch (error) {
      Alert.alert('Analysis Failed', 'Could not process the image.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ padding: 24, paddingTop: 60 }}>
      <View className="items-center mb-8">
        <View className="w-16 h-16 bg-blue-600 rounded-3xl items-center justify-center shadow-lg shadow-blue-500/50">
          <Camera color="white" size={32} />
        </View>
        <Text className="text-2xl font-bold mt-4 text-slate-900">Dental AI Scan</Text>
        <Text className="text-sm text-slate-500 text-center mt-1">Upload a clear photo of your dental concern for instant analysis.</Text>
      </View>

      {!image ? (
        <TouchableOpacity 
          onPress={pickImage}
          className="w-full aspect-square bg-white rounded-[3rem] border border-dashed border-blue-200 items-center justify-center shadow-sm"
        >
           <View className="w-20 h-20 bg-blue-50 rounded-full items-center justify-center mb-4">
              <Camera color="#2563eb" size={32} />
           </View>
           <Text className="text-blue-600 font-bold text-lg">Select Dental Photo</Text>
           <Text className="text-slate-400 text-xs mt-1">Gallery or Camera</Text>
        </TouchableOpacity>
      ) : (
        <View className="space-y-6">
          <View className="relative w-full aspect-square rounded-[3rem] overflow-hidden shadow-xl">
             <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
             {isAnalyzing && (
               <View className="absolute inset-0 bg-blue-900/40 items-center justify-center">
                  <ActivityIndicator size="large" color="white" />
                  <Text className="text-white font-bold mt-4">AI Analyzing Infection...</Text>
               </View>
             )}
             <TouchableOpacity 
              onPress={pickImage}
              disabled={isAnalyzing}
              className="absolute bottom-6 right-6 w-12 h-12 bg-white rounded-full items-center justify-center shadow-md"
             >
                <RefreshCcw color="#2563eb" size={24} />
             </TouchableOpacity>
          </View>

          {result && (
            <View className="space-y-4">
               <Card className="rounded-[2.5rem] border border-blue-100 bg-white">
                  <CardContent className="p-6">
                     <View className="flex-row items-center mb-4">
                        <View className="w-8 h-8 bg-blue-600 rounded-lg items-center justify-center">
                           <ShieldCheck color="white" size={18} />
                        </View>
                        <Text className="text-lg font-bold text-slate-900 ml-3">AI Detection Result</Text>
                     </View>
                     
                     <Text className="text-base text-slate-800 font-medium leading-relaxed">
                       "{result.detection}"
                     </Text>

                     <View className="mt-6 pt-6 border-t border-slate-50">
                        <Text className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Professional Advice & Prevention</Text>
                        <View className="space-y-3">
                           {result.prevention.map((tip, idx) => (
                             <View key={idx} className="flex-row items-start">
                                <View className="mt-1">
                                   <CheckCircle2 color="#22c55e" size={16} />
                                </View>
                                <Text className="flex-1 ml-3 text-sm text-slate-600 font-medium">{tip}</Text>
                             </View>
                           ))}
                        </View>
                     </View>
                  </CardContent>
               </Card>

               <View className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100 flex-row">
                  <Info color="#b45309" size={24} />
                  <View className="ml-4 flex-1">
                     <Text className="text-amber-900 font-bold mb-1">Disclaimer</Text>
                     <Text className="text-amber-800 text-xs leading-relaxed">
                       This AI analysis is for informational purposes only. It is NOT a clinical diagnosis. Always consult with a qualified dentist for proper examination.
                     </Text>
                  </View>
               </View>

               <Button 
                onPress={() => Alert.alert('Appointment', 'Redirecting to booking...')}
                title="Book with Specialist"
                className="h-14 rounded-2xl"
               />
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}
