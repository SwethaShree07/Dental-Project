import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  PhoneOff, 
  MessageSquare, 
  UserPlus, 
  Settings,
  MoreVertical,
  Maximize2,
  ArrowLeft,
  X,
  Send
} from 'lucide-react';
import { Button } from '@/components/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/avatar';
import { ScrollArea } from '@/components/scroll-area';
import { Input } from '@/components/input';
import { toast } from 'sonner';

export const TeleConsultation = ({ onBack, doctorName = "Dr. Arul Selvan" }: { onBack: () => void, doctorName?: string }) => {
  const [isJoined, setIsJoined] = useState(false);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<{sender: string, text: string, time: string}[]>([]);
  const [inputText, setInputText] = useState('');

  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    setMessages([...messages, { sender: 'You', text: inputText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setInputText('');
    
    // Auto-response mock
    setTimeout(() => {
        setMessages(prev => [...prev, { 
            sender: doctorName, 
            text: "Hello! I can see your scan results now. Let's discuss.", 
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
        }]);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-slate-950 flex flex-col">
      <AnimatePresence>
        {!isJoined ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-white text-center space-y-8"
          >
            <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-blue-500/30 flex items-center justify-center">
                    <Video className="w-12 h-12 text-blue-500 animate-pulse" />
                </div>
                <div className="absolute inset-0 rounded-full border border-blue-500 animate-[ping_3s_infinite]" />
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-bold">Waiting for Doctor</h2>
                <p className="text-slate-400 text-sm">{doctorName} will join shortly...</p>
            </div>

            <div className="flex gap-6">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`rounded-full w-14 h-14 border-slate-800 bg-slate-900 ${!isMicOn ? 'text-red-500 bg-red-500/10' : 'text-white'}`}
                >
                    {isMicOn ? <Mic /> : <MicOff />}
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`rounded-full w-14 h-14 border-slate-800 bg-slate-900 ${!isVideoOn ? 'text-red-500 bg-red-500/10' : 'text-white'}`}
                >
                    {isVideoOn ? <Video /> : <VideoOff />}
                </Button>
            </div>

            <div className="flex flex-col gap-3 w-full max-w-xs pt-8">
                <Button 
                    onClick={() => setIsJoined(true)}
                    className="h-14 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                >
                    Enter Room
                </Button>
                <Button 
                    variant="ghost" 
                    onClick={onBack}
                    className="text-slate-500"
                >
                    Leave Meeting
                </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 relative flex flex-col"
          >
            {/* Main Video Area (Mock Dr) */}
            <div className="flex-1 bg-slate-900 relative overflow-hidden">
                <img 
                    src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=800&q=80" 
                    className="w-full h-full object-cover opacity-80" 
                    alt="Doctor"
                />
                
                {/* Selfie Overly */}
                <div className="absolute top-6 right-6 w-32 aspect-[3/4] rounded-2xl bg-slate-800 border-2 border-white/10 overflow-hidden shadow-2xl">
                    <div className="w-full h-full bg-slate-700 flex items-center justify-center">
                        <UserPlus className="w-8 h-8 text-slate-500" />
                    </div>
                </div>

                {/* Info Overlay */}
                <div className="absolute top-6 left-6 flex items-center gap-3 bg-black/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
                    <div className="w-px h-3 bg-white/20 mx-1" />
                    <span className="text-white/80 text-[10px]">{doctorName}</span>
                </div>
            </div>

            {/* Chat Sidebar Overlay */}
            <AnimatePresence>
                {showChat && (
                    <motion.div 
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        className="absolute right-0 inset-y-0 w-80 bg-white shadow-2xl z-20 flex flex-col"
                    >
                        <header className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">Room Chat</h3>
                            <Button variant="ghost" size="icon" onClick={() => setShowChat(false)}><X className="w-4 h-4" /></Button>
                        </header>
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-4">
                                {messages.map((m, idx) => (
                                    <div key={idx} className={`flex flex-col ${m.sender === 'You' ? 'items-end' : 'items-start'}`}>
                                        <div className={`p-3 rounded-2xl max-w-[85%] text-xs ${m.sender === 'You' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'}`}>
                                            {m.text}
                                        </div>
                                        <span className="text-[9px] text-slate-400 mt-1">{m.time}</span>
                                    </div>
                                ))}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t flex gap-2">
                            <Input 
                                placeholder="Message..." 
                                className="h-10 rounded-xl"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                            />
                            <Button size="icon" onClick={handleSendMessage} className="rounded-xl bg-blue-600"><Send className="w-4 h-4" /></Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="h-24 bg-slate-950 flex items-center justify-center gap-4 px-6 border-t border-slate-900">
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsMicOn(!isMicOn)}
                    className={`rounded-full w-12 h-12 border-slate-800 bg-slate-900 ${!isMicOn ? 'text-red-500 bg-red-500/10' : 'text-slate-400'}`}
                >
                    {isMicOn ? <Mic /> : <MicOff />}
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setIsVideoOn(!isVideoOn)}
                    className={`rounded-full w-12 h-12 border-slate-800 bg-slate-900 ${!isVideoOn ? 'text-red-500 bg-red-500/10' : 'text-slate-400'}`}
                >
                    {isVideoOn ? <Video /> : <VideoOff />}
                </Button>
                
                <Button 
                    onClick={onBack}
                    className="rounded-full w-16 h-12 bg-red-500 hover:bg-red-600 text-white"
                >
                    <PhoneOff className="w-6 h-6" />
                </Button>

                <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => setShowChat(!showChat)}
                    className={`relative rounded-full w-12 h-12 border-slate-800 bg-slate-900 ${showChat ? 'text-blue-500 bg-blue-500/10' : 'text-slate-400'}`}
                >
                    <MessageSquare />
                    {messages.length > 0 && !showChat && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />}
                </Button>
                <Button 
                    variant="outline" 
                    size="icon" 
                    className="rounded-full w-12 h-12 border-slate-800 bg-slate-900 text-slate-400"
                >
                    <MoreVertical />
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
