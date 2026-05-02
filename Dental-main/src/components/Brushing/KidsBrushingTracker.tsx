import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Music, 
  Video, 
  Star, 
  Trophy, 
  Heart,
  Calendar,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/card';
import { Badge } from '@/components/badge';
import { toast } from 'sonner';

export const KidsBrushingTracker = ({ onBack }: { onBack: () => void }) => {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutes
  const [isActive, setIsActive] = useState(false);
  const [showReward, setShowReward] = useState(false);
  const [streak, setStreak] = useState(5);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
        setProgress(((120 - (timeLeft - 1)) / 120) * 100);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      clearInterval(interval);
      setIsActive(false);
      setShowReward(true);
      toast.success("Great job! You earned a star! ⭐");
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(120);
    setProgress(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-[#F0F7FF] p-6 pb-24">
      <header className="flex items-center justify-between mb-8">
        <Button variant="ghost" size="icon" onClick={onBack} className="rounded-full bg-white shadow-sm">
          <ArrowLeft className="w-5 h-5 text-blue-600" />
        </Button>
        <div className="flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm border border-blue-100">
          <Trophy className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-slate-700">{streak} Day Streak!</span>
        </div>
      </header>

      <div className="flex flex-col items-center text-center space-y-6">
        <div className="relative">
          <motion.div 
            animate={isActive ? { scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] } : {}}
            transition={{ repeat: Infinity, duration: 2 }}
            className="w-48 h-48 rounded-full bg-white shadow-2xl flex items-center justify-center border-8 border-blue-500 relative z-10"
          >
            <div className="text-4xl font-black text-blue-600">
              {formatTime(timeLeft)}
            </div>
          </motion.div>
          
          {/* Decorative burst */}
          <div className="absolute inset-0 bg-blue-400/20 blur-3xl rounded-full scale-150 -z-10" />
        </div>

        <div className="w-full max-w-sm space-y-2">
            <div className="flex justify-between text-[11px] font-bold text-blue-400 uppercase tracking-widest px-1">
                <span>Brushing...</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-4 w-full bg-white rounded-full overflow-hidden shadow-inner border border-blue-50 p-1">
                <motion.div 
                    className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>
        </div>

        <div className="flex gap-4">
          <Button 
            onClick={toggleTimer}
            size="lg"
            className={`rounded-full w-20 h-20 shadow-xl transition-all ${isActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
          </Button>
          <Button 
            onClick={resetTimer}
            variant="outline"
            size="lg"
            className="rounded-full w-20 h-20 bg-white border-blue-100 text-blue-600 hover:bg-blue-50 shadow-lg"
          >
            <RotateCcw className="w-8 h-8" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 w-full max-w-sm mt-8">
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-pink-50 text-pink-500 group-hover:scale-110 transition-transform">
                        <Music className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Brush DJ</span>
                </CardContent>
            </Card>
            <Card className="border-none shadow-md bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all cursor-pointer group">
                <CardContent className="p-4 flex flex-col items-center gap-2">
                    <div className="p-3 rounded-2xl bg-purple-50 text-purple-500 group-hover:scale-110 transition-transform">
                        <Video className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-700">Fun Videos</span>
                </CardContent>
            </Card>
        </div>

        <div className="w-full space-y-4 mt-8">
            <h4 className="flex items-center gap-2 text-slate-800 font-bold px-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Next Rewards
            </h4>
            <div className="flex gap-4 overflow-x-auto pb-4 px-2 no-scrollbar">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex-shrink-0 w-24 aspect-square rounded-3xl bg-slate-100 border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 gap-1">
                        <Star className="w-8 h-8 opacity-20" />
                        <span className="text-[10px] font-bold">Lvl {i+5}</span>
                    </div>
                ))}
            </div>
        </div>
      </div>

      <AnimatePresence>
        {showReward && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-blue-600/90 backdrop-blur-lg"
          >
            <div className="bg-white rounded-[40px] p-8 text-center space-y-6 shadow-2xl relative overflow-hidden">
                <motion.div 
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                    className="absolute -top-20 -right-20 w-40 h-40 bg-yellow-100 rounded-full blur-3xl opacity-50"
                />
                
                <div className="relative">
                    <Trophy className="w-24 h-24 text-yellow-500 mx-auto" />
                    <motion.div 
                        animate={{ y: [0, -20, 0], opacity: [0, 1, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="absolute top-0 right-1/2 translate-x-12"
                    >
                        <Sparkles className="w-8 h-8 text-yellow-500" />
                    </motion.div>
                </div>

                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-slate-900">BRUSHING PRO!</h2>
                    <p className="text-slate-500">You've earned 50 points and a new sticker!</p>
                </div>

                <Button 
                    onClick={() => setShowReward(false)}
                    className="w-full h-14 rounded-2xl bg-blue-600 text-white text-lg font-bold shadow-xl shadow-blue-200"
                >
                    Claim Reward
                </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
