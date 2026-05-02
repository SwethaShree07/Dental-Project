import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, TextInput } from 'react-native';
import { MapPin, Search, Star, MessageSquare, Calendar, ChevronRight, SlidersHorizontal, Map as MapIcon } from 'lucide-react-native';
import { DUMMY_DOCTORS } from '../../src/data/data';
import { Card, CardContent } from '../../src/components/ui/Card';
import { Button } from '../../src/components/ui/Button';

export default function MapScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');

  const filters = ['All', 'Orthodontist', 'Periodontist', 'Pediatric', 'General'];

  const filteredDoctors = DUMMY_DOCTORS.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         doc.specialization.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = activeFilter === 'All' || doc.specialization.includes(activeFilter);
    return matchesSearch && matchesFilter;
  });

  return (
    <View className="flex-1 bg-slate-50">
      {/* Map Placeholder Header */}
      <View className="h-[35%] bg-blue-100 items-center justify-center overflow-hidden">
         {/* Simple Visual Map Placeholder */}
         <View className="absolute inset-0 bg-blue-50">
            <View className="absolute top-10 left-20 w-3 h-3 bg-blue-600 rounded-full" />
            <View className="absolute top-40 left-10 w-3 h-3 bg-blue-600 rounded-full" />
            <View className="absolute top-20 right-20 w-3 h-3 bg-blue-600 rounded-full" />
            <View className="absolute bottom-20 left-40 w-3 h-3 bg-red-600 rounded-full scale-150 shadow-lg shadow-red-500/50" />
         </View>
         <View className="z-10 bg-white/90 backdrop-blur-md px-6 py-3 rounded-full flex-row items-center border border-white shadow-lg">
            <MapPin color="#2563eb" size={18} />
            <Text className="ml-2 font-bold text-slate-900">Chennai, Tamil Nadu</Text>
         </View>
         <TouchableOpacity className="absolute bottom-4 right-4 w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg">
            <MapIcon color="white" size={24} />
         </TouchableOpacity>
      </View>

      <View className="flex-1 -mt-8 bg-slate-50 rounded-t-[3rem] p-6 pt-8">
         {/* Search & Filters */}
         <View className="flex-row items-center bg-white h-14 rounded-2xl px-4 mb-6 shadow-sm border border-slate-100">
            <Search color="#94a3b8" size={20} />
            <TextInput 
              className="flex-1 ml-3 text-slate-900 font-medium"
              placeholder="Search specialists..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholderTextColor="#94a3b8"
            />
            <TouchableOpacity className="p-2">
               <SlidersHorizontal color="#64748b" size={20} />
            </TouchableOpacity>
         </View>

         <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          className="flex-grow-0 mb-6"
          contentContainerStyle={{ paddingRight: 20 }}
         >
            {filters.map(f => (
              <TouchableOpacity 
                key={f}
                onPress={() => setActiveFilter(f)}
                className={`mr-2 px-6 py-2.5 rounded-full border ${activeFilter === f ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}
              >
                <Text className={`font-bold text-xs ${activeFilter === f ? 'text-white' : 'text-slate-500'}`}>{f}</Text>
              </TouchableOpacity>
            ))}
         </ScrollView>

         <Text className="text-lg font-bold text-slate-900 mb-4 px-1">Nearby Specialists ({filteredDoctors.length})</Text>

         <ScrollView showsVerticalScrollIndicator={false} className="flex-1">
            {filteredDoctors.map(doc => (
              <Card key={doc.id} className="mb-4 rounded-[2rem] border border-slate-100">
                 <CardContent className="p-5 flex-row">
                    <Image 
                      source={{ uri: doc.avatar }} 
                      className="w-20 h-20 rounded-2xl bg-slate-100"
                    />
                    <View className="flex-1 ml-4 justify-center">
                       <View className="flex-row justify-between items-start">
                          <View className="flex-1">
                             <Text className="font-bold text-slate-900 text-base" numberOfLines={1}>{doc.name}</Text>
                             <Text className="text-blue-600 text-[10px] font-bold uppercase">{doc.specialization}</Text>
                          </View>
                          <View className="flex-row items-center bg-amber-50 px-2 py-0.5 rounded-md">
                             <Star color="#f59e0b" size={10} fill="#f59e0b" />
                             <Text className="text-amber-700 text-[10px] font-bold ml-1">{doc.rating}</Text>
                          </View>
                       </View>
                       
                       <View className="flex-row items-center mt-2">
                          <MapPin color="#64748b" size={12} />
                          <Text className="text-slate-500 text-[11px] ml-1">{doc.clinicName} • 1.2 km</Text>
                       </View>

                       <View className="flex-row mt-3 space-x-2">
                          <TouchableOpacity className="flex-1 bg-blue-50 h-10 rounded-xl items-center justify-center flex-row">
                             <MessageSquare color="#2563eb" size={14} />
                             <Text className="text-blue-600 font-bold text-[11px] ml-2">Chat</Text>
                          </TouchableOpacity>
                          <TouchableOpacity className="flex-1 bg-blue-600 h-10 rounded-xl items-center justify-center flex-row">
                             <Calendar color="white" size={14} />
                             <Text className="text-white font-bold text-[11px] ml-2">Book</Text>
                          </TouchableOpacity>
                       </View>
                    </View>
                 </CardContent>
              </Card>
            ))}
            
            {filteredDoctors.length === 0 && (
              <View className="py-20 items-center">
                 <Search color="#cbd5e1" size={48} />
                 <Text className="text-slate-400 mt-4 text-center">No specialists found matching your search.</Text>
              </View>
            )}
         </ScrollView>
      </View>
    </View>
  );
}
