import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Thermometer, Box, RefreshCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';

const App: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [lastResult, setLastResult] = useState<{
        items: { label: string; temp: number; x: number; y: number; w: number; h: number }[];
    } | null>(null);
    const [status, setStatus] = useState<'idle' | 'processing' | 'error'>('idle');

    useEffect(() => {
        startCamera();
    }, []);

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment' }
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera access error:", err);
            setStatus('error');
        }
    };

    const handleScan = async () => {
        if (!videoRef.current || !canvasRef.current || status === 'processing') return;

        setStatus('processing');
        const canvas = canvasRef.current;
        const video = videoRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0);
            const imageData = canvas.toDataURL('image/jpeg');

            try {
                // Send to Netlify Function (Mocked for now)
                // const response = await fetch('/.netlify/functions/detect', {
                //   method: 'POST',
                //   body: JSON.stringify({ image: imageData })
                // });
                // const data = await response.json();

                // Simulation for presentation:
                setTimeout(() => {
                    setLastResult({
                        items: [
                            { label: 'Cup', temp: 42.5, x: 100, y: 150, w: 200, h: 300 }
                        ]
                    });
                    setStatus('idle');
                    setIsScanning(true);
                }, 1500);

            } catch (err) {
                setStatus('error');
            }
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg mb-6 flex items-center justify-between"
            >
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-500/20">
                        <Thermometer className="text-white" size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold tracking-tight">Thermal Sense AI</h1>
                        <p className="text-xs text-slate-400">Powered by Z.ai GLM-4V</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {status === 'processing' && <RefreshCcw className="animate-spin text-slate-400" size={20} />}
                    {status === 'error' && <ShieldAlert className="text-red-500" size={20} />}
                </div>
            </motion.div>

            {/* Camera Viewport */}
            <div className="relative w-full max-w-lg aspect-[3/4] glass-card overflow-hidden shadow-2xl">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover grayscale opacity-60"
                />

                {/* Detection Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    <AnimatePresence>
                        {lastResult && lastResult.items.map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0 }}
                                style={{
                                    left: `${(item.x / 640) * 100}%`,
                                    top: `${(item.y / 853) * 100}%`,
                                    width: `${(item.w / 640) * 100}%`,
                                    height: `${(item.h / 853) * 100}%`,
                                }}
                                className={`absolute border-2 ${item.temp > 40 ? 'border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'border-blue-500'} rounded-lg transition-colors duration-500`}
                            >
                                <div className={`absolute -top-8 left-0 px-2 py-1 rounded-t-md text-xs font-bold whitespace-nowrap ${item.temp > 40 ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'}`}>
                                    {item.label} | {item.temp}°C {item.temp > 40 ? '🔥 HOT' : ''}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>

                {/* Scanning Line */}
                {status === 'processing' && (
                    <motion.div
                        initial={{ top: '0%' }}
                        animate={{ top: '100%' }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute left-0 right-0 h-1 bg-red-400 opacity-50 shadow-[0_0_10px_rgba(248,113,113,0.8)] z-10"
                    />
                )}
            </div>

            {/* Controls */}
            <div className="mt-8 w-full max-w-lg flex flex-col gap-4">
                <button
                    onClick={handleScan}
                    disabled={status === 'processing'}
                    className={`w-full py-4 rounded-2xl flex items-center justify-center gap-3 font-bold text-lg transition-all active:scale-95 ${status === 'processing'
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-xl shadow-red-600/30'
                        }`}
                >
                    {status === 'processing' ? '分析中...' : <><Camera size={24} /> スキャン開始</>}
                </button>

                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Thermometer className="text-red-500 mb-2" size={20} />
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Threshold</span>
                        <span className="text-xl font-bold">40.0°C</span>
                    </div>
                    <div className="glass-card p-4 flex flex-col items-center">
                        <Box className="text-blue-400 mb-2" size={20} />
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest leading-none mb-1">Target</span>
                        <span className="text-xl font-bold">Cups</span>
                    </div>
                </div>
            </div>

            {/* Status Bar */}
            <footer className="mt-auto py-6 text-slate-500 text-xs text-center">
                Ready to detect thermal anomalies.
            </footer>

            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
};

export default App;
