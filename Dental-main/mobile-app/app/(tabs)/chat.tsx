import React, { useState, useRef, useEffect } from 'react';
import { View, Text, FlatList, KeyboardAvoidingView, Platform, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Send, ArrowLeft, Check, CheckCheck, Bot, User, Stethoscope } from 'lucide-react-native';
import { Message, Role } from '../../src/types';
import { chatWithAI } from '../../src/services/geminiService';
import { getAuthSession } from '../../src/services/authService';

export default function ChatScreen() {
  const [activeTab, setActiveTab] = useState<'ai' | 'doctor'>('ai');
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'ai-welcome',
      senderId: 'ai',
      receiverId: 'me',
      text: "Hello! I'm your Alpha Dent AI Assistant. How can I help you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: 'read'
    }
  ]);
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      senderId: 'me',
      receiverId: activeTab,
      text: inputText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      readStatus: 'sent'
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    if (activeTab === 'ai') {
      // AI Response
      const responseText = await chatWithAI(inputText, []);
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        senderId: 'ai',
        receiverId: 'me',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        readStatus: 'read'
      };
      setMessages(prev => [...prev, aiMsg]);
    } else {
      // Mock Doctor Response
      setTimeout(() => {
        const docMsg: Message = {
          id: (Date.now() + 1).toString(),
          senderId: 'doctor',
          receiverId: 'me',
          text: "Thanks for reaching out. A specialist will review your query within 24 hours.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          readStatus: 'read'
        };
        setMessages(prev => [...prev, docMsg]);
      }, 1500);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.senderId === 'me';
    return (
      <View className={`mb-4 flex-row ${isMe ? 'justify-end' : 'justify-start'}`}>
        {!isMe && (
          <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-2 self-end mb-1">
             {activeTab === 'ai' ? <Bot color="#2563eb" size={16} /> : <Stethoscope color="#2563eb" size={16} />}
          </View>
        )}
        <View 
          className={`max-w-[75%] px-4 py-3 rounded-3xl ${
            isMe ? 'bg-blue-600 rounded-br-none' : 'bg-white rounded-bl-none shadow-sm'
          }`}
        >
           <Text className={`text-sm ${isMe ? 'text-white' : 'text-slate-800'}`}>{item.text}</Text>
           <View className="flex-row items-center justify-end mt-1 space-x-1">
              <Text className={`text-[9px] ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>{item.timestamp}</Text>
              {isMe && <CheckCheck color="#bfdbfe" size={10} />}
           </View>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      className="flex-1 bg-slate-50"
    >
      {/* Header with Tabs */}
      <View className="bg-white pt-14 pb-4 px-6 border-b border-slate-100 shadow-sm">
         <View className="flex-row items-center mb-4">
            <Text className="text-xl font-bold text-slate-900 flex-1">Messaging</Text>
         </View>
         <View className="flex-row bg-slate-100 p-1 rounded-2xl">
            <TouchableOpacity 
              onPress={() => {
                setActiveTab('ai');
                setMessages([{
                  id: 'ai-welcome',
                  senderId: 'ai',
                  receiverId: 'me',
                  text: "Hello! I'm your Alpha Dent AI Assistant. How can I help you today?",
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  readStatus: 'read'
                }]);
              }}
              className={`flex-1 flex-row items-center justify-center py-2 rounded-xl ${activeTab === 'ai' ? 'bg-white shadow-sm' : ''}`}
            >
               <Bot color={activeTab === 'ai' ? '#2563eb' : '#64748b'} size={16} />
               <Text className={`ml-2 font-bold ${activeTab === 'ai' ? 'text-slate-900' : 'text-slate-500'}`}>AI Assistant</Text>
            </TouchableOpacity>
            <TouchableOpacity 
               onPress={() => {
                 setActiveTab('doctor');
                 setMessages([]);
               }}
               className={`flex-1 flex-row items-center justify-center py-2 rounded-xl ${activeTab === 'doctor' ? 'bg-white shadow-sm' : ''}`}
            >
               <Stethoscope color={activeTab === 'doctor' ? '#2563eb' : '#64748b'} size={16} />
               <Text className={`ml-2 font-bold ${activeTab === 'doctor' ? 'text-slate-900' : 'text-slate-500'}`}>Specialist</Text>
            </TouchableOpacity>
         </View>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={item => item.id}
        renderItem={renderMessage}
        contentContainerStyle={{ padding: 20 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      <View className="p-4 bg-white border-t border-slate-100 flex-row items-center space-x-3">
         <TextInput 
           className="flex-1 bg-slate-100 h-12 rounded-full px-5 text-slate-900"
           placeholder="Type message here..."
           value={inputText}
           onChangeText={setInputText}
           placeholderTextColor="#94a3b8"
         />
         <TouchableOpacity 
          onPress={sendMessage}
          className="w-12 h-12 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/30"
         >
           <Send color="white" size={20} />
         </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
