import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Send, 
  FileText, 
  Image as ImageIcon, 
  ShieldCheck, 
  Users, 
  Search,
  Plus,
  MoreVertical,
  Paperclip,
  CheckCheck
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/avatar';
import { ScrollArea } from '@/components/scroll-area';
import { Input } from '@/components/input';
import { Badge } from '@/components/badge';
import { toast } from 'sonner';

export const InternalCommunicator = () => {
  const [activeChat, setActiveChat] = useState('team-general');
  const [messages, setMessages] = useState([
    { id: '1', sender: 'Dr. Vikram Seth', role: 'Head Surgeon', text: 'Hey team, just uploaded the X-rays for Patient #4421. Please review.', time: '09:15 AM', status: 'read' },
    { id: '2', sender: 'Nurse Sneha', role: 'Nursing Lead', text: 'On it, Dr. Vikram. Looks like there\'s some inflammation in the lower canal.', time: '09:18 AM', status: 'read' },
    { id: '3', sender: 'Receptionist Kavita', role: 'Front Desk', text: 'Schedule update: Dr. Selvan\'s 10AM appointment has rescheduled to tomorrow.', time: '09:45 AM', status: 'sent' },
  ]);
  const [inputText, setInputText] = useState('');

  const handleSend = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { 
      id: Date.now().toString(), 
      sender: 'You', 
      role: 'Doctor', 
      text: inputText, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'sent'
    }]);
    setInputText('');
  };

  return (
    <div className="flex bg-slate-50 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 h-[calc(100vh-140px)]">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-slate-100 flex flex-col">
        <header className="p-6 border-b border-slate-100 space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Team Chat</h2>
                <Button size="icon" variant="ghost" className="rounded-xl bg-slate-50"><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input placeholder="Search chats..." className="pl-9 h-10 rounded-xl bg-slate-50 border-none text-xs" />
            </div>
        </header>

        <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
                {[
                    { id: 'team-general', name: 'General Clinic Team', last: 'Receptionist Kavita: Schedule...', time: '09:45 AM', unread: 2, icon: Users },
                    { id: 'surgical', name: 'Surgical Unit', last: 'Dr. Seth: X-rays ready', time: '09:15 AM', unread: 0, icon: ShieldCheck },
                    { id: 'emergency', name: 'Emergency Updates', last: 'New patient arriving...', time: '08:30 AM', unread: 0, icon: ShieldCheck },
                ].map((chat) => (
                    <button 
                        key={chat.id}
                        onClick={() => setActiveChat(chat.id)}
                        className={`w-full p-4 rounded-2xl flex gap-3 transition-all ${activeChat === chat.id ? 'bg-blue-50' : 'hover:bg-slate-50'}`}
                    >
                        <div className={`p-2.5 rounded-xl ${activeChat === chat.id ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-400'}`}>
                            <chat.icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 text-left overflow-hidden">
                            <div className="flex justify-between items-center mb-0.5">
                                <span className="font-bold text-sm text-slate-800 truncate">{chat.name}</span>
                                <span className="text-[10px] text-slate-400">{chat.time}</span>
                            </div>
                            <p className="text-xs text-slate-500 truncate">{chat.last}</p>
                        </div>
                        {chat.unread > 0 && (
                            <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-[10px] text-white self-center">
                                {chat.unread}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </ScrollArea>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            <div className="flex items-center gap-2 text-[10px] font-bold text-green-600 uppercase tracking-widest bg-white px-3 py-1.5 rounded-full shadow-sm border border-green-100">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                HIPAA Compliant
            </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        <header className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
                    <Users className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="font-bold text-slate-800">General Clinic Team</h3>
                    <p className="text-xs text-slate-400">12 members online</p>
                </div>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl"><Search className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
            </div>
        </header>

        <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
                <div className="flex justify-center">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-widest">Today</span>
                </div>
                {messages.map((m) => (
                    <div key={m.id} className={`flex gap-3 ${m.sender === 'You' ? 'flex-row-reverse' : ''}`}>
                        <Avatar className="w-10 h-10 rounded-xl shadow-sm">
                            <AvatarFallback className="bg-slate-200 text-slate-600 font-bold text-xs">{m.sender[0]}</AvatarFallback>
                        </Avatar>
                        <div className={`space-y-1 max-w-[70%] ${m.sender === 'You' ? 'items-end' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold text-slate-800">{m.sender}</span>
                                <Badge variant="outline" className="text-[9px] py-0 h-4 border-slate-200 text-slate-400">{m.role}</Badge>
                            </div>
                            <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                m.sender === 'You' 
                                ? 'bg-blue-600 text-white rounded-tr-none' 
                                : 'bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none'
                            }`}>
                                {m.text}
                            </div>
                            <div className={`flex items-center gap-1.5 mt-1 ${m.sender === 'You' ? 'justify-end' : ''}`}>
                                <span className="text-[10px] text-slate-400">{m.time}</span>
                                {m.sender === 'You' && <CheckCheck className="w-3 h-3 text-blue-400" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </ScrollArea>

        <div className="p-6 border-t border-slate-100">
            <Card className="border-none shadow-xl bg-slate-50 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/20 transition-all">
                <div className="p-3 flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600"><Paperclip className="w-5 h-5" /></Button>
                    <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-blue-600"><ImageIcon className="w-5 h-5" /></Button>
                    <div className="w-px h-6 bg-slate-200 mx-2" />
                    <Input 
                        placeholder="Type a team update..." 
                        className="border-none bg-transparent h-12 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <Button 
                        onClick={handleSend}
                        className="rounded-xl h-10 px-6 bg-blue-600 text-white font-bold shadow-lg shadow-blue-200 ml-2"
                    >
                        <Send className="w-4 h-4 mr-2" />
                        Send
                    </Button>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
