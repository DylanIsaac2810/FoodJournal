'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ChefHat } from 'lucide-react';

const DIETARY_OPTIONS = [
  { id: 'Ninguna', label: 'Ninguna restricción', icon: '🍽️' },
  { id: 'Vegetariano', label: 'Vegetariano', icon: '🥗' },
  { id: 'Vegano', label: 'Vegano', icon: '🌱' },
  { id: 'Sin Gluten', label: 'Sin Gluten', icon: '🌾' },
  { id: 'Keto', label: 'Keto / Baja en carbohidratos', icon: '🥑' },
];

const ALLERGY_OPTIONS = [
  { id: 'Ninguna', label: 'Ninguna alergia', icon: '✅' },
  { id: 'Lácteos', label: 'Lácteos', icon: '🥛' },
  { id: 'Maní/Nueces', label: 'Maní o Nueces', icon: '🥜' },
  { id: 'Mariscos', label: 'Mariscos', icon: '🦐' },
  { id: 'Soya', label: 'Soya', icon: '🫘' },
  { id: 'Huevo', label: 'Huevo', icon: '🥚' },
];

const TOOLS_OPTIONS = [
  { id: 'Estufa', label: 'Estufa', icon: '🔥' },
  { id: 'Horno', label: 'Horno', icon: '🌡️' },
  { id: 'Microondas', label: 'Microondas', icon: '🍱' },
  { id: 'Air Fryer', label: 'Freidora de Aire', icon: '🌪️' },
  { id: 'Licuadora', label: 'Licuadora', icon: '🥤' },
];

export function OnboardingModal({ onComplete }: { onComplete: () => void }) {
  const [name, setName] = useState('');
  const [selectedDiets, setSelectedDiets] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);
  const [selectedTools, setSelectedTools] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClient();

  // Función inteligente para seleccionar opciones (si elige "Ninguna", borra las demás)
  const toggleSelection = (id: string, list: string[], setList: (v: string[]) => void) => {
    if (id === 'Ninguna') {
      setList(['Ninguna']);
      return;
    }
    let newList = list.includes(id) ? list.filter(item => item !== id) : [...list, id];
    newList = newList.filter(item => item !== 'Ninguna'); // Quita el "Ninguna" si selecciona otra cosa
    setList(newList);
  };

  // Guardado normal para herramientas (donde no hay opción "Ninguna")
  const toggleTool = (id: string) => {
    if (selectedTools.includes(id)) {
      setSelectedTools(selectedTools.filter(item => item !== id));
    } else {
      setSelectedTools([...selectedTools, id]);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return alert("Por favor ingresa tu nombre.");
    if (selectedTools.length === 0) return alert("Selecciona al menos una herramienta de cocina.");
    if (selectedDiets.length === 0) return alert("Selecciona al menos una preferencia alimenticia (o 'Ninguna').");
    if (selectedAllergies.length === 0) return alert("Selecciona al menos una alergia (o 'Ninguna').");

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado.");

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: name,
        dietary_preferences: selectedDiets,
        allergies: selectedAllergies, // Guardamos las alergias en la BD
        cooking_tools: selectedTools,
        onboarding_completed: true
      });

      if (error) throw error;
      onComplete(); 
    } catch (err: any) {
      // JSON.stringify nos mostrará el contenido real del objeto de error de Supabase
      console.error("Error guardando perfil:", JSON.stringify(err, null, 2), err);
      
      // Mostramos un alert más descriptivo
      alert("Hubo un error al guardar tu perfil: " + (err.message || err.details || "Revisa la consola"));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#335C67]/80 backdrop-blur-md">
      <div className="bg-[#FFFAE6] rounded-3xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto scrollbar-hide">
        
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#9E2A2B] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <ChefHat size={32} color="#FFF3B0" />
          </div>
          <h2 className="text-3xl font-bold text-[#335C67] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
            ¡Bienvenido a Food Journey!
          </h2>
          <p className="text-[#5a8a96]">Personalicemos tu experiencia para darte recetas seguras y a tu medida.</p>
        </div>

        <div className="space-y-6">
          {/* Nombre */}
          <div>
            <label className="block text-sm font-bold text-[#335C67] mb-2">¿Cómo prefieres que te llamemos?</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Chef Maestro" 
              className="w-full px-4 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none focus:border-[#E09F3E]" 
            />
          </div>

          {/* Alergias (NUEVO) */}
          <div>
            <label className="block text-sm font-bold text-[#335C67] mb-2">Alergias e Intolerancias</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {ALLERGY_OPTIONS.map(allergy => (
                <button
                  key={allergy.id}
                  onClick={() => toggleSelection(allergy.id, selectedAllergies, setSelectedAllergies)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2 transition-all ${
                    selectedAllergies.includes(allergy.id) 
                      ? 'border-[#9E2A2B] bg-[#9E2A2B]/10 text-[#9E2A2B]' 
                      : 'border-transparent bg-white text-[#5a8a96] hover:bg-gray-50'
                  }`}
                >
                  <span>{allergy.icon}</span> {allergy.label}
                </button>
              ))}
            </div>
          </div>

          {/* Preferencias Alimenticias */}
          <div>
            <label className="block text-sm font-bold text-[#335C67] mb-2">Preferencias y Dietas</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {DIETARY_OPTIONS.map(diet => (
                <button
                  key={diet.id}
                  onClick={() => toggleSelection(diet.id, selectedDiets, setSelectedDiets)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2 transition-all ${
                    selectedDiets.includes(diet.id) 
                      ? 'border-[#E09F3E] bg-[#E09F3E]/10 text-[#c98a30]' 
                      : 'border-transparent bg-white text-[#5a8a96] hover:bg-gray-50'
                  }`}
                >
                  <span>{diet.icon}</span> {diet.label}
                </button>
              ))}
            </div>
          </div>

          {/* Herramientas */}
          <div>
            <label className="block text-sm font-bold text-[#335C67] mb-2">¿Con qué herramientas cuentas para cocinar?</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TOOLS_OPTIONS.map(tool => (
                <button
                  key={tool.id}
                  onClick={() => toggleTool(tool.id)}
                  className={`p-3 rounded-xl border-2 text-sm font-bold flex items-center gap-2 transition-all ${
                    selectedTools.includes(tool.id) 
                      ? 'border-[#335C67] bg-[#335C67]/10 text-[#335C67]' 
                      : 'border-transparent bg-white text-[#5a8a96] hover:bg-gray-50'
                  }`}
                >
                  <span>{tool.icon}</span> {tool.label}
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="w-full py-4 mt-6 bg-[#335C67] hover:bg-[#234149] text-[#FFF3B0] font-bold rounded-xl flex justify-center gap-2 transition-colors shadow-md text-lg"
          >
            {isSaving ? <Loader2 size={24} className="animate-spin" /> : "Comenzar mi viaje culinario"}
          </button>
        </div>
      </div>
    </div>
  );
}