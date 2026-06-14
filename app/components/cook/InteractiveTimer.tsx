'use client';

import { useState, useEffect, useRef } from "react";
import { Timer, Plus, Minus, Play, Pause, RotateCcw } from "lucide-react";

export function InteractiveTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const [customMinutes, setCustomMinutes] = useState(defaultMinutes || 5);
  const [totalSeconds, setTotalSeconds] = useState((defaultMinutes || 5) * 60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setCustomMinutes(defaultMinutes || 5);
    setTotalSeconds((defaultMinutes || 5) * 60);
    setIsRunning(false);
  }, [defaultMinutes]);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            clearInterval(intervalRef.current!);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isRunning]);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const progress = totalSeconds / ((customMinutes || 1) * 60);
  const circumference = 2 * Math.PI * 48;

  const reset = () => { setIsRunning(false); setTotalSeconds(customMinutes * 60); };
  const adjustTime = (d: number) => {
    const n = Math.max(1, customMinutes + d);
    setCustomMinutes(n); setTotalSeconds(n * 60); setIsRunning(false);
  };

  return (
    <div className="rounded-3xl p-5 shadow-lg" style={{ backgroundColor: "#335C67" }}>
      <div className="flex items-center gap-2 mb-4">
        <Timer size={15} color="#E09F3E" />
        <span style={{ color: "#FFF3B0", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em" }}>TEMPORIZADOR</span>
      </div>
      <div className="flex justify-center mb-4">
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,243,176,0.1)" strokeWidth="7" />
            <circle
              cx="60" cy="60" r="48" fill="none" stroke={totalSeconds === 0 ? "#9E2A2B" : "#E09F3E"}
              strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)} transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 1s linear, stroke 0.3s" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 500, color: totalSeconds === 0 ? "#9E2A2B" : "#FFF3B0", lineHeight: 1 }}>
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center gap-3 mb-4">
        <button onClick={() => adjustTime(-1)} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-[#FFF3B0] hover:bg-white/20"><Minus size={12} /></button>
        <span style={{ color: "rgba(255,243,176,0.6)", fontSize: 12 }}>{customMinutes} min</span>
        <button onClick={() => adjustTime(1)} className="w-7 h-7 rounded-full flex items-center justify-center bg-white/10 text-[#FFF3B0] hover:bg-white/20"><Plus size={12} /></button>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setIsRunning(!isRunning)} className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl transition-all text-white font-bold text-sm shadow-sm hover:brightness-110" style={{ backgroundColor: isRunning ? "#E09F3E" : "#9E2A2B" }}>
          {isRunning ? <><Pause size={15} /> Pausar</> : <><Play size={15} /> Iniciar</>}
        </button>
        <button onClick={reset} className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/10 text-[#FFF3B0] hover:bg-white/20"><RotateCcw size={15} /></button>
      </div>
      {totalSeconds === 0 && (
        <div className="mt-3 py-2 rounded-2xl text-center bg-[#9E2A2B]/40 text-[#FFF3B0] font-bold text-xs animate-pulse">
          ⏰ ¡Tiempo terminado!
        </div>
      )}
    </div>
  );
}