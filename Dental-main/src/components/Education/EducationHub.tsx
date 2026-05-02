import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, PerspectiveCamera, Backdrop, ContactShadows, useGLTF } from '@react-three/drei';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Info, 
  ArrowLeft, 
  Download, 
  Share2, 
  Layers, 
  Eye, 
  ChevronRight,
  GraduationCap,
  Sparkles,
  Search
} from 'lucide-react';
import { Button } from '@/components/button';
import { Card, CardContent } from '@/components/card';
import { Badge } from '@/components/badge';
import { Input } from '@/components/input';
import { ScrollArea } from '@/components/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/tabs';

// A simple 3D component to represent a dental structure (implants, etc)
const DentalModel = ({ type }: { type: string }) => {
  return (
    <group>
      {type === 'implant' ? (
        <>
            {/* The "Root" part */}
            <mesh position={[0, -0.5, 0]}>
                <cylinderGeometry args={[0.2, 0.1, 1, 32]} />
                <meshStandardMaterial color="#bbbbbb" metalness={0.8} roughness={0.2} />
            </mesh>
            {/* The "Crown" part */}
            <mesh position={[0, 0.5, 0]}>
                <capsuleGeometry args={[0.4, 0.6, 16, 32]} />
                <meshStandardMaterial color="#ffffff" roughness={0.1} />
            </mesh>
        </>
      ) : (
        <mesh>
            <boxGeometry args={[1, 1, 0.2]} />
            <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      )}
    </group>
  );
};

export const EducationHub = ({ onBack }: { onBack: () => void }) => {
  const [selectedProcedure, setSelectedProcedure] = useState('implant');
  
  const procedures = [
    { id: 'implant', title: 'Dental Implant', description: 'Advanced replacement for a missing tooth using a titanium root.', duration: '4 min' },
    { id: 'veneer', title: 'Porcelain Veneers', description: 'Thin shells of porcelain to improve tooth aesthetics.', duration: '3 min' },
    { id: 'root-canal', title: 'Root Canal Therapy', description: 'Saving a severely infected tooth by removing the pulp.', duration: '5 min' },
    { id: 'braces', title: 'Orthodontic Alignment', description: 'Correcting tooth positioning for a perfect bite.', duration: '6 min' }
  ];

  return (
    <div className="flex h-[calc(100vh-140px)] gap-6 p-6">
      {/* Sidebar Content */}
      <div className="w-[400px] flex flex-col gap-6">
        <header className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl bg-white shadow-sm border border-slate-100">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Button>
            <div>
                <h1 className="text-xl font-bold text-slate-800">Education Hub</h1>
                <p className="text-[10px] uppercase font-black text-blue-600 tracking-widest">Digital Service Design</p>
            </div>
        </header>

        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input placeholder="Search procedures..." className="pl-10 h-12 rounded-2xl bg-white border-none shadow-sm" />
        </div>

        <ScrollArea className="flex-1 -mx-2 px-2">
            <div className="space-y-3">
                {procedures.map((p) => (
                    <Card 
                        key={p.id}
                        onClick={() => setSelectedProcedure(p.id)}
                        className={`border-none shadow-sm cursor-pointer transition-all hover:shadow-md ${selectedProcedure === p.id ? 'bg-blue-600 text-white' : 'bg-white text-slate-700'}`}
                    >
                        <CardContent className="p-4 flex gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selectedProcedure === p.id ? 'bg-white/20' : 'bg-blue-50 text-blue-600'}`}>
                                <Layers className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-bold truncate text-sm">{p.title}</h3>
                                    <Badge className={`text-[9px] border-none ${selectedProcedure === p.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>{p.duration}</Badge>
                                </div>
                                <p className={`text-[11px] line-clamp-2 ${selectedProcedure === p.id ? 'text-blue-50' : 'text-slate-400'}`}>{p.description}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </ScrollArea>

        <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 transition-transform bg-blue-600 rounded-lg">
                        <Share2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold">Share with Patient</h4>
                        <p className="text-[10px] text-slate-400">Send educational video to mobile</p>
                    </div>
                </div>
                <Button className="w-full h-11 bg-white text-slate-900 font-bold rounded-xl hover:bg-slate-100">
                    Generate Link
                </Button>
            </CardContent>
        </Card>
      </div>

      {/* Main 3D Viewer */}
      <Card className="flex-1 border-none shadow-2xl relative bg-slate-50 overflow-hidden rounded-[40px] border border-white">
        <div className="absolute inset-0 z-0">
          <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0, 4], fov: 50 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} shadow-mapSize={[512, 512]} castShadow />
            <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6}>
                    <DentalModel type={selectedProcedure} />
                </Stage>
            </Suspense>
            <OrbitControls autoRotate autoRotateSpeed={0.5} enablePan={false} enableZoom={true} minPolarAngle={Math.PI / 2.2} maxPolarAngle={Math.PI / 2.2} />
            <ContactShadows position={[0, -1, 0] } opacity={0.4} scale={10} blur={2} far={4.5} />
          </Canvas>
        </div>

        {/* HUD Elements */}
        <div className="absolute top-8 left-8 p-6 bg-white/40 backdrop-blur-xl border border-white/40 rounded-3xl z-10 space-y-2 max-w-xs shadow-xl">
            <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-blue-600 text-white border-none py-1">Interactive 3D</Badge>
                <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-slate-900">{procedures.find(p => p.id === selectedProcedure)?.title}</h2>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">Click and drag to rotate the model and explain the structure to the patient.</p>
        </div>

        <div className="absolute bottom-8 left-8 right-8 flex justify-between items-end z-10 pointer-events-none">
            <div className="flex gap-3 pointer-events-auto">
                <Button className="h-14 w-14 rounded-2xl bg-white shadow-xl text-slate-800 hover:bg-slate-50"><Eye className="w-6 h-6" /></Button>
                <Button className="h-14 px-6 rounded-2xl bg-white shadow-xl text-slate-800 font-bold hover:bg-slate-50"><Play className="w-5 h-5 mr-2" /> Start Walkthrough</Button>
            </div>
            
            <div className="p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/10 flex gap-6 pointer-events-auto shadow-2xl">
                <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Success Rate</p>
                    <p className="text-lg font-black text-blue-400">98%</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div className="text-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase mb-1">Procedure Time</p>
                    <p className="text-lg font-black text-white">45m</p>
                </div>
            </div>
        </div>
      </Card>
    </div>
  );
};
