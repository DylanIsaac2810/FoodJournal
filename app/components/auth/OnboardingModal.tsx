'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, AlertCircle, AlertTriangle } from 'lucide-react';

// ─── OPCIONES SINCRONIZADAS CON EL PERFIL ─────────────────────────────────
const DIETARY_OPTIONS = [
  { id: 'Balanceado', label: 'Balanceado', icon: '⚖️' },
  { id: 'Vegetariano', label: 'Vegetariano', icon: '🥗' },
  { id: 'Vegano', label: 'Vegano', icon: '🌱' },
  { id: 'Keto', label: 'Keto', icon: '🥑' },
  { id: 'Sin Gluten', label: 'Sin Gluten', icon: '🌾' },
  { id: 'Sin Lácteos', label: 'Sin Lácteos', icon: '🚫🥛' },
  { id: 'Pescatariano', label: 'Pescatariano', icon: '🐟' },
];

const ALLERGY_OPTIONS = [
  { id: 'Ninguna', label: 'Ninguna', icon: '✅' },
  { id: 'Nueces', label: 'Nueces', icon: '🥜' },
  { id: 'Mariscos', label: 'Mariscos', icon: '🦐' },
  { id: 'Huevo', label: 'Huevo', icon: '🥚' },
  { id: 'Lácteos', label: 'Lácteos', icon: '🥛' },
  { id: 'Soya', label: 'Soya', icon: '🫘' },
  { id: 'Gluten', label: 'Gluten', icon: '🌾' },
  { id: 'Pescado', label: 'Pescado', icon: '🐟' },
];

const TOOLS_OPTIONS = [
  { id: 'Horno', label: 'Horno', icon: '🌡️' },
  { id: 'Microondas', label: 'Microondas', icon: '🍱' },
  { id: 'Licuadora', label: 'Licuadora', icon: '🥤' },
  { id: 'Sartén', label: 'Sartén', icon: '🍳' },
  { id: 'Olla de presión', label: 'Olla de presión', icon: '🍲' },
  { id: 'Air Fryer', label: 'Air Fryer', icon: '🌪️' },
  { id: 'Batidora', label: 'Batidora', icon: '🥣' },
  { id: 'Procesador de alimentos', label: 'Procesador', icon: '⚙️' },
];

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  // ─── ESTADO PARA LA NOTIFICACIÓN TOAST ───
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'error' | 'warning'}>({ show: false, message: "", type: "error" });

  const supabase = createClient();

  // Función para mostrar el toast y ocultarlo automáticamente
  const showToast = (message: string, type: 'error' | 'warning' = 'error') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  const toggleSelection = (id: string, list: string[], setList: (v: string[]) => void) => {
    if (id === 'Ninguna') {
      setList(['Ninguna']);
      return;
    }
    let newList = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    newList = newList.filter(item => item !== 'Ninguna');
    setList(newList);
  };

  const toggleTool = (id: string) => {
    setSelectedTools(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleSave = async () => {
    if (!name.trim()) return showToast("Por favor ingresa tu nombre.", "warning");
    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado.");

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name,
        dietary_preferences: selectedDiets,
        allergies: selectedAllergies,
        cooking_tools: selectedTools,
        onboarding_completed: true
      });

      if (error) throw error;
      onComplete(); // Al terminar cierra el modal
    } catch (err: any) {
      showToast("Error al guardar perfil: " + (err.message), "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 bg-[#335C67]/80 backdrop-blur-sm">
      
      {/* ── TOAST NOTIFICATION ── */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        } ${
          toast.type === 'error' ? 'bg-[#9E2A2B] text-white' :
          'bg-[#FFFAE6] border-2 border-[#E09F3E] text-[#b87d2a]'
        }`}
      >
        {toast.type === 'error' ? <AlertCircle size={22} /> : <AlertTriangle size={22} />}
        <span className="font-bold text-sm">{toast.message}</span>
      </div>

      <div className="bg-[#FFFAE6] rounded-3xl p-6 w-full max-w-xl shadow-2xl flex flex-col max-h-[95vh]">
        
        {/* Header Fijo */}
        <div className="text-center mb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-[#335C67]" style={{ fontFamily: "'Playfair Display', serif" }}>
            ¡Bienvenido a Food Journal!
          </h2>
          <p className="text-[#5a8a96] text-sm">Personaliza tu experiencia culinaria</p>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-2">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#335C67] mb-1">Tu nombre</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="¿Cómo prefieres que te llamemos?" 
              className="w-full px-4 py-2.5 rounded-xl border border-[#335C67]/20 text-black text-sm outline-none focus:border-[#E09F3E]" 
            />
          </div>

          {/* Opciones */}
          {[
            { title: "Alergias e Intolerancias", list: selectedAllergies, setList: setSelectedAllergies, options: ALLERGY_OPTIONS, isTool: false },
            { title: "Preferencias Dietéticas", list: selectedDiets, setList: setSelectedDiets, options: DIETARY_OPTIONS, isTool: false },
            { title: "Herramientas en la Cocina", list: selectedTools, setList: setSelectedTools, options: TOOLS_OPTIONS, isTool: true },
          ].map((section, idx) => (
            <div key={idx}>
              <label className="block text-xs font-bold text-[#335C67] mb-2">{section.title}</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {section.options.map(opt => {
                  const isSelected = section.list.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => section.isTool ? toggleTool(opt.id) : toggleSelection(opt.id, section.list, section.setList)}
                      className={`px-3 py-2 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                        isSelected 
                          ? 'border-[#9E2A2B] bg-[#9E2A2B]/10 text-[#9E2A2B]' 
                          : 'border-gray-200 bg-white text-[#5a8a96] hover:border-gray-300'
                      }`}
                    >
                      {opt.icon} <span className="truncate">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Footer Fijo */}
        <div className="flex-shrink-0 pt-4 mt-2">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-3 bg-[#335C67] hover:bg-[#234149] text-[#FFF3B0] font-bold rounded-xl flex justify-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Comenzar mi viaje culinario"}
          </button>
        </div>
      </div>
    </div>
  );
}