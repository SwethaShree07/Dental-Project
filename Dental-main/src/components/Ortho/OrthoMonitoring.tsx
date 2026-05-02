import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Camera as CameraIcon, 
  History, 
  CheckCircle2, 
  AlertCircle,
  TrendingUp,
  ArrowLeft,
  ChevronRight,
  Info,
  Calendar
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/card';
import { Badge } from '@/components/badge';
import { ScrollArea } from '@/components/scroll-area';
import { toast } from 'sonner';

export const OrthoMonitoring = ({ onBack, onCaptureScan }: { onBack: () => void, onCaptureScan: (base64: string) => void }) => {
  const [activeTab, setActiveTab] = useState<'scan' | 'history' | 'compliance'>('scan');

  return (
    <div className="min-h-screen bg-slate-50 p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm border border-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
                <h1 className="text-xl font-bold text-slate-900">Ortho Monitor</h1>
                <p className="text-[10px] uppercase font-bold text-blue-500 tracking-wider">Alpha Dent Advanced AI</p>
            </div>
        </div>
      </header>

      <div className="space-y-6">
        {/* Compliance Summary */}
        <Card className="border-none shadow-xl bg-gradient-to-br from-indigo-600 to-blue-500 text-white overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <p className="text-blue-100 text-xs font-medium mb-1">Weekly Compliance</p>
                        <h2 className="text-3xl font-black">94%</h2>
                    </div>
                    <Badge className="bg-white/20 text-white border-none backdrop-blur-md">Week 12 of 24</Badge>
                </div>
                <div className="space-y-2">
                    <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: '94%' }}
                            className="h-full bg-white rounded-full"
                        />
                    </div>
                    <div className="flex justify-between text-[10px] text-blue-50 font-medium">
                        <span>Keep it up! Only 12 weeks to go.</span>
                        <span>4 days since last scan</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Action Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-white p-1.5 rounded-2xl shadow-sm">
            {[
                { id: 'scan', label: 'New Scan', icon: CameraIcon },
                { id: 'history', label: 'Progress', icon: History },
                { id: 'compliance', label: 'Estatics', icon: CheckCircle2 }
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-all ${
                        activeTab === tab.id 
                        ? 'bg-blue-50 text-blue-600 shadow-inner' 
                        : 'text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <tab.icon className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{tab.label}</span>
                </button>
            ))}
        </div>

        <ScrollArea className="h-[calc(100vh-400px)]">
            <AnimatePresence mode="wait">
                {activeTab === 'scan' && (
                    <motion.div 
                        key="scan"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-6"
                    >
                        <Card className="border-none shadow-md bg-white p-8 text-center space-y-4">
                            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mx-auto">
                                <CameraIcon className="w-10 h-10 text-blue-600" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="font-bold text-slate-800">Check Your Alignment</h3>
                                <p className="text-xs text-slate-500 max-w-[200px] mx-auto">Take 3 clear photos of your teeth to update your progress with AI.</p>
                            </div>
                            <Button 
                                onClick={() => toast.info("Opening scanner...")}
                                className="w-full h-12 rounded-2xl bg-blue-600 text-white font-bold"
                            >
                                Start Ortho Scan
                            </Button>
                        </Card>

                        <div className="bg-amber-50 rounded-2xl p-4 flex gap-4 border border-amber-100">
                            <Info className="w-5 h-5 text-amber-500 shrink-0" />
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-amber-800 uppercase">Pro Tip</p>
                                <p className="text-[11px] text-amber-700 leading-snug">Ensure you're in a brightly lit room and remove your aligners before scanning for the best AI accuracy.</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'history' && (
                    <motion.div 
                        key="history"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-4"
                    >
                        {[
                            { date: 'Oct 12', status: 'Excellent', score: 98, img: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=200&q=80' },
                            { date: 'Oct 05', status: 'Good', score: 85, img: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=200&q=80' },
                            { date: 'Sep 28', status: 'Improve', score: 62, img: 'https://images.unsplash.com/photo-1598256989800-fe5f95da9787?w=200&q=80' },
                        ].map((item, i) => (
                            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden flex h-24">
                                <img src={item.img} className="w-24 h-full object-cover" alt="Ortho" />
                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase">{item.date}</p>
                                            <h4 className="text-sm font-bold text-slate-800">Scan Reviewed</h4>
                                        </div>
                                        <Badge className={`text-[9px] ${item.score > 80 ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'} border-none`}>
                                            {item.score}% Match
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] text-blue-600 font-medium">
                                        <TrendingUp className="w-3 h-3" />
                                        Progress: +2.4% this week
                                    </div>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </ScrollArea>
      </div>
    </div>
  );
};
