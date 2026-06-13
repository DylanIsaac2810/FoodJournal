'use client';

import { useState, useEffect, useRef } from "react";
import { Clock, Users, Play, Pause, RotateCcw, Plus, Minus, Star, ShoppingCart, AlertCircle, CheckCircle2, Timer } from "lucide-react";

const filters = [
  { label: "Todas", value: "all" },
  { label: "🌱 Vegano", value: "vegan" },
  { label: "🥗 Baja Grasa", value: "lowfat" },
  { label: "⚡ Rápida", value: "quick" },
  { label: "🌾 Sin Gluten", value: "glutenfree" },
];

const recipes = [
  {
    id: 1,
    name: "Curry de Espinacas y Garbanzos",
    tags: ["vegan", "lowfat", "glutenfree"],
    time: 30,
    servings: 4,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&h=400&fit=crop&auto=format",
    description: "Un curry reconfortante hecho con básicos de la alacena y espinacas frescas. Rico en proteína vegetal y hierro.",
    missingIngredients: ["Leche de coco", "Garam masala"],
    ownedIngredients: ["Espinaca", "Garbanzos", "Ajo", "Aceite de Oliva", "Tomates Cherry"],
    steps: [
      { step: 1, instruction: "Calienta aceite de oliva a fuego medio. Añade el ajo y fríe por 2 min.", time: 3 },
      { step: 2, instruction: "Añade tomates cherry y cocina por 5 min presionando suavemente.", time: 5 },
      { step: 3, instruction: "Agrega garbanzos, especias y mezcla bien.", time: 2 },
      { step: 4, instruction: "Vierte leche de coco y cocina a fuego lento por 10 min.", time: 10 },
      { step: 5, instruction: "Agrega espinacas hasta que se marchiten. Sazona al gusto.", time: 5 }
    ],
    nutrition: { calorías: 320, proteína: "14g", carbohidratos: "38g", grasas: "12g" },
  }
];

// --- Subcomponente del Temporizador ---
function CookingTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const [totalSeconds, setTotalSeconds] = useState(defaultMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [customMinutes, setCustomMinutes] = useState(defaultMinutes);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTotalSeconds((prev) => {
          if (prev <= 0) {
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
  const progress = totalSeconds / (customMinutes * 60);
  const circumference = 2 * Math.PI * 54;

  const reset = () => { setIsRunning(false); setTotalSeconds(customMinutes * 60); };
  const adjustTime = (delta: number) => {
    const newMins = Math.max(1, customMinutes + delta);
    setCustomMinutes(newMins);
    setTotalSeconds(newMins * 60);
    setIsRunning(false);
  };

  return (
    <div className="rounded-3xl p-6 bg-[#335C67] shadow-lg">
      <div className="flex items-center gap-2 mb-6">
        <Timer size={20} color="#E09F3E" />
        <span className="text-[#FFF3B0] font-bold text-sm tracking-wider">TEMPORIZADOR</span>
      </div>
      
      {/* Círculo Animado */}
      <div className="flex flex-col items-center mb-6">
        <div className="relative w-[140px] h-[140px]">
          <svg width="140" height="140" viewBox="0 0 140 140">
            <circle cx="70" cy="70" r="54" fill="none" stroke="rgba(255,243,176,0.1)" strokeWidth="8" />
            <circle cx="70" cy="70" r="54" fill="none" stroke={totalSeconds === 0 ? "#9E2A2B" : "#E09F3E"} strokeWidth="8" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} transform="rotate(-90 70 70)" className="transition-all duration-1000 ease-linear" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center font-mono text-3xl font-bold text-[#FFF3B0]">
            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4 mb-6">
        <button onClick={() => adjustTime(-1)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><Minus size={16} /></button>
        <span className="text-white/80 font-medium">{customMinutes} min</span>
        <button onClick={() => adjustTime(1)} className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20"><Plus size={16} /></button>
      </div>

      <div className="flex gap-3">
        <button onClick={() => setIsRunning(!isRunning)} className={`flex-1 py-3 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-colors ${isRunning ? 'bg-[#E09F3E] hover:bg-[#c98a30]' : 'bg-[#9E2A2B] hover:bg-[#7d2122]'}`}>
          {isRunning ? <><Pause size={20} /> Pausar</> : <><Play size={20} /> Iniciar</>}
        </button>
        <button onClick={reset} className="p-3 rounded-2xl bg-white/10 text-white hover:bg-white/20"><RotateCcw size={20} /></button>
      </div>
    </div>
  );
}

// --- Vista Principal ---
export default function RecipeView() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedRecipe, setSelectedRecipe] = useState(recipes[0]);
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10">
      
      {/* Columna Izquierda: Lista de Recetas */}
      <div className="w-full lg:w-1/3 flex flex-col gap-6">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#335C67] mb-4">Descubre Recetas</h1>
          <div className="flex flex-wrap gap-2">
            {filters.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveFilter(f.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${activeFilter === f.value ? 'bg-[#9E2A2B] text-white' : 'bg-white text-[#335C67] border border-[#335C67]/20 hover:bg-gray-50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4 overflow-y-auto lg:max-h-[calc(100vh-200px)] pr-2">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              onClick={() => { setSelectedRecipe(recipe); setActiveStep(0); setCompletedSteps([]); }}
              className={`text-left rounded-2xl overflow-hidden border-2 transition-all ${recipe.id === selectedRecipe.id ? 'border-[#9E2A2B] shadow-md bg-white' : 'border-transparent bg-white/60 hover:bg-white hover:border-[#335C67]/20'}`}
            >
              <img src={recipe.image} alt={recipe.name} className="w-full h-32 object-cover" />
              <div className="p-4">
                <h3 className="font-bold text-[#335C67] mb-2">{recipe.name}</h3>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-[#5a8a96]"><Clock size={14} /> {recipe.time}m</span>
                  <span className="flex items-center gap-1 text-[#E09F3E] font-bold"><Star size={14} fill="#E09F3E" /> {recipe.rating}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Columna Derecha: Detalle de la Receta */}
      <div className="w-full lg:w-2/3 bg-white rounded-3xl overflow-hidden shadow-sm border border-[#335C67]/10">
        <div className="relative h-64 lg:h-80 w-full">
          <img src={selectedRecipe.image} alt={selectedRecipe.name} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent flex flex-col justify-end p-8">
            <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4">{selectedRecipe.name}</h2>
            <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm font-medium">
              <span className="flex items-center gap-2"><Clock size={16} /> {selectedRecipe.time} min</span>
              <span className="flex items-center gap-2"><Users size={16} /> {selectedRecipe.servings} porciones</span>
            </div>
          </div>
        </div>

        <div className="p-8 grid lg:grid-cols-5 gap-8">
          
          {/* Instrucciones */}
          <div className="lg:col-span-3">
            <p className="text-[#5a8a96] leading-relaxed mb-8">{selectedRecipe.description}</p>
            
            <h3 className="font-serif text-2xl font-bold text-[#335C67] mb-6">Preparación</h3>
            <div className="space-y-4">
              {selectedRecipe.steps.map((step, idx) => {
                const isDone = completedSteps.includes(idx);
                const isActive = idx === activeStep && !isDone;
                return (
                  <div 
                    key={step.step} 
                    onClick={() => { setActiveStep(idx); setCompletedSteps(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]); }}
                    className={`flex gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${isDone ? 'bg-gray-50 border-transparent opacity-60' : isActive ? 'bg-[#FFFAE6] border-[#E09F3E]' : 'bg-white border-gray-100 hover:border-[#E09F3E]/50'}`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isDone ? 'bg-[#335C67] text-white' : isActive ? 'bg-[#9E2A2B] text-white' : 'bg-gray-200 text-[#335C67]'}`}>
                      {isDone ? <CheckCircle2 size={16} /> : step.step}
                    </div>
                    <p className={`text-sm ${isDone ? 'line-through text-gray-500' : 'text-[#335C67]'}`}>{step.instruction}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Temporizador y Tips */}
          <div className="lg:col-span-2 space-y-6">
            <CookingTimer defaultMinutes={selectedRecipe.steps[Math.min(activeStep, selectedRecipe.steps.length - 1)]?.time || 5} />
            
            <div className="bg-[#FFFAE6] rounded-3xl p-6 border border-[#E09F3E]/20">
              <div className="flex items-center gap-2 mb-3 text-[#E09F3E] font-bold">
                <AlertCircle size={20} /> Tip del Chef
              </div>
              <p className="text-sm text-[#5a8a96] leading-relaxed">Prueba la comida mientras cocinas. Ajustar la sal al final hace una gran diferencia.</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}