'use client';
import Link from 'next/link';
import { useState, useEffect } from "react";
import {
  ChefHat, Clock, Users, Plus, Minus,
  Star, ShoppingCart, AlertCircle, CheckCircle2, Timer,
  Sparkles, SlidersHorizontal, X, ChevronDown,
  ChevronUp, Flame, History, Heart, Loader2, AlertTriangle
} from "lucide-react";
import { createClient } from '@/utils/supabase/client';

// ─── Filter categories ───────────────────────────────────────────────────────
const filterCategories = [
  { id: "mealType", label: "Tipo de Comida", options: ["Desayuno", "Comida", "Cena", "Snack", "Colación", "Entrada", "Bebida"] },
  { id: "dishType", label: "Tipo de Platillo", options: ["Plato fuerte", "Ensalada", "Sopa", "Pasta", "Sandwich", "Taco", "Hamburguesa", "Botana", "Postre", "Bebida"] },
  { id: "flavor", label: "Perfil de Sabor", options: ["Dulce", "Salado", "Picante", "Agridulce", "Ácido", "Umami", "Cremoso", "Ahumado", "Cítrico", "Especiado"] },
  { id: "nutrition", label: "Nutrición y Dieta", options: ["Alto en proteína", "Bajo en carbohidratos", "Bajo en calorías", "Alto en fibra", "Keto", "Vegetariano", "Vegano", "Sin gluten", "Sin lactosa", "Balanceado"] },
  { id: "cuisine", label: "Cocina / Región", options: ["Mexicana", "Italiana", "Japonesa", "China", "Coreana", "India", "Francesa", "Española", "Mediterránea", "Estadounidense"] },
  { id: "occasion", label: "Ocasión", options: ["Diario", "Escolar", "Oficina", "Fiesta", "Cumpleaños", "Reunión familiar", "Parrillada", "Navidad", "Año Nuevo", "Evento especial"] },
  { id: "temperature", label: "Temperatura del Platillo", options: ["Caliente", "Tibio", "Frío"] },
];

// ─── Static Cooking Timer ────────────────────────────────────────────────────
function CookingTimer({ defaultMinutes }: { defaultMinutes: number }) {
  const circumference = 2 * Math.PI * 48;
  const progress = 1;

  return (
    <div className="rounded-3xl p-5" style={{ backgroundColor: "#335C67" }}>
      <div className="flex items-center gap-2 mb-4">
        <Timer size={15} color="#E09F3E" />
        <span style={{ color: "#FFF3B0", fontWeight: 700, fontSize: 12, letterSpacing: "0.06em" }}>TIEMPO ESTIMADO</span>
      </div>
      <div className="flex justify-center mb-4">
        <div style={{ position: "relative", width: 120, height: 120 }}>
          <svg width="120" height="120" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="48" fill="none" stroke="rgba(255,243,176,0.1)" strokeWidth="7" />
            <circle cx="60" cy="60" r="48" fill="none" stroke="#E09F3E" strokeWidth="7" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={0} transform="rotate(-90 60 60)" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span style={{ fontFamily: "'DM Mono', monospace", fontSize: 26, fontWeight: 500, color: "#FFF3B0", lineHeight: 1 }}>
              {String(defaultMinutes).padStart(2, "0")}:00
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Advanced Filters Drawer ──────────────────────────────────────────────────
function FiltersDrawer({ open, onClose, selected, onToggle, onClear }: { open: boolean; onClose: () => void; selected: Record<string, string[]>; onToggle: (cat: string, val: string) => void; onClear: () => void; }) {
  const [expanded, setExpanded] = useState<string[]>([filterCategories[0].id]);
  const toggleAccordion = (id: string) => setExpanded((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);
  const totalSelected = Object.values(selected).flat().length;

  return (
    <>
      <div className="fixed inset-0 z-40 transition-opacity" style={{ backgroundColor: "rgba(51,92,103,0.45)", backdropFilter: "blur(4px)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} onClick={onClose} />
      <div className="fixed top-0 right-0 bottom-0 z-50 flex flex-col" style={{ width: 400, maxWidth: "90vw", backgroundColor: "#fff", transform: open ? "translateX(0)" : "translateX(100%)", transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)", boxShadow: "-12px 0 48px rgba(51,92,103,0.18)" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: "#335C67", fontWeight: 800, fontSize: 20 }}>Filtros Avanzados</h3>
            {totalSelected > 0 && <span style={{ fontSize: 13, color: "#9E2A2B", fontWeight: 600 }}>{totalSelected} activo{totalSelected !== 1 ? "s" : ""}</span>}
          </div>
          <div className="flex items-center gap-3">
            {totalSelected > 0 && (
              <button onClick={onClear} style={{ fontSize: 13, color: "#9E2A2B", fontWeight: 600 }}>
                Limpiar todo
              </button>
            )}
            <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center bg-gray-100 hover:bg-gray-200 transition-colors"><X size={18} color="#335C67" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2">
          {filterCategories.map((cat) => {
            const isOpen = expanded.includes(cat.id);
            const activeCount = selected[cat.id]?.length || 0;
            return (
              <div key={cat.id} className="rounded-2xl overflow-hidden border border-gray-100">
                <button onClick={() => toggleAccordion(cat.id)} className="w-full flex items-center justify-between px-4 py-3.5 transition-colors" style={{ backgroundColor: isOpen ? "rgba(51,92,103,0.04)" : "#fff" }}>
                  <div className="flex items-center gap-2">
                    <span style={{ fontWeight: 700, color: "#335C67", fontSize: 14 }}>{cat.label}</span>
                    {activeCount > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#9E2A2B] text-white text-xs font-bold">{activeCount}</span>}
                  </div>
                  {isOpen ? <ChevronUp size={16} color="#5a8a96" /> : <ChevronDown size={16} color="#5a8a96" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 flex flex-wrap gap-2">
                    {cat.options.map((opt) => {
                      const active = selected[cat.id]?.includes(opt);
                      return (
                        <button key={opt} onClick={() => onToggle(cat.id, opt)} className="px-3 py-1.5 rounded-full text-sm transition-all" style={{ backgroundColor: active ? "#335C67" : "rgba(51,92,103,0.06)", color: active ? "#fff" : "#335C67", fontWeight: active ? 700 : 500, border: active ? "none" : "1px solid rgba(51,92,103,0.12)" }}>{opt}</button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-6 py-5 border-t border-gray-100">
          <button onClick={onClose} className="w-full py-3.5 rounded-2xl flex items-center justify-center gap-2 bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold text-sm transition-colors shadow-md"><CheckCircle2 size={17} /> Aplicar Filtros</button>
        </div>
      </div>
    </>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function RecipeView() {
  const supabase = createClient();

  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  
  const [servings, setServings] = useState(4);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string[]>>({});
  const [generating, setGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // ─── ESTADO PARA LA NOTIFICACIÓN TOAST ───
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'warning'}>({ show: false, message: "", type: "success" });

  const totalFilters = Object.values(selectedFilters).flat().length;

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => { loadHistory(true); }, []);

  const loadHistory = async (showLoader = false) => {
    if(showLoader) setIsLoading(true);
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data } = await supabase.from('saved_recipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
        
        if (data && data.length > 0) {
        const parsedRecipes = data.map(r => ({ db_id: r.id, is_favorite: r.is_favorite, ...r.recipe_data }));
        setRecipes(parsedRecipes);
        setRecipes(currentRecipes => {
            if(!selectedRecipe && parsedRecipes.length > 0) setSelectedRecipe(parsedRecipes[0]);
            return parsedRecipes;
        });
        }
    } catch (error) {
        console.error("Error cargando recetas:", error);
    } finally {
        if(showLoader) setIsLoading(false);
    }
  };

  const toggleFilter = (cat: string, val: string) => {
    setSelectedFilters((prev) => {
      const current = prev[cat] || [];
      return { ...prev, [cat]: current.includes(val) ? current.filter((x) => x !== val) : [...current, val] };
    });
  };

  const clearFilters = () => setSelectedFilters({});

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      const { data: items } = await supabase.from('pantry_items').select('*').eq('user_id', user.id);
      
      const pantryInfo = items?.map(i => ({
        ingredient_name: i.ingredient_name, quantity: i.quantity, unit: i.unit
      })) || [];

      const flatFilters = Object.values(selectedFilters).flat();

      const response = await fetch('/api/generate-recipes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profile || { allergies: [], dietary_preferences: [], cooking_tools: [] },
          pantry: pantryInfo,
          filters: flatFilters,
          servings: servings
          // Eliminamos la llamada de imageBase64
        })
      });

      const newRecipes = await response.json();
      if (newRecipes.error) throw new Error(newRecipes.error);

      for (const rec of newRecipes) {
        await supabase.from('saved_recipes').insert({
          user_id: user.id,
          title: rec.name,
          recipe_api_id: Math.random().toString(36).substr(2, 9), 
          recipe_data: rec,
          is_favorite: false
        });
      }

      await loadHistory(false);
      
      const { data: newHistory } = await supabase.from('saved_recipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if(newHistory && newHistory.length > 0) {
        setSelectedRecipe({ db_id: newHistory[0].id, is_favorite: newHistory[0].is_favorite, ...newHistory[0].recipe_data });
      }
      
      showToast("¡Nuevas recetas generadas con éxito!", "success");

    } catch (error: any) {
      console.error(error);
      // REEMPLAZO DEL ALERT FEO
      showToast("Error al generar recetas. Revisa tu conexión o intenta con menos filtros.", "error");
    } finally {
      setGenerating(false);
    }
  };

  const toggleFavorite = async (recipe: any) => {
    const newStatus = !recipe.is_favorite;
    await supabase.from('saved_recipes').update({ is_favorite: newStatus }).eq('id', recipe.db_id);
    
    if(selectedRecipe && selectedRecipe.db_id === recipe.db_id) {
       setSelectedRecipe({...selectedRecipe, is_favorite: newStatus});
    }
    await loadHistory(false); 
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-[#FFFAE6]">
        <Loader2 className="animate-spin text-[#E09F3E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-[#335C67] animate-pulse">Pensando en recetas...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 font-sans min-h-screen bg-[#FFFAE6]">
      
      {/* ── TOAST NOTIFICATION ── */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
          toast.show ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0 pointer-events-none'
        } ${
          toast.type === 'error' ? 'bg-[#9E2A2B] text-white' :
          toast.type === 'warning' ? 'bg-[#FFFAE6] border-2 border-[#E09F3E] text-[#b87d2a]' :
          'bg-[#335C67] text-[#FFF3B0]'
        }`}
      >
        {toast.type === 'error' ? <AlertCircle size={22} /> : toast.type === 'warning' ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
        <span className="font-bold text-sm">{toast.message}</span>
      </div>

      {/* ── COLUMNA IZQUIERDA (CONTROLES Y LISTA) ── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
        
        {/* PANEL GENERADOR */}
        <div className="bg-white p-6 rounded-3xl border border-[#335C67]/10 shadow-sm">
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: "#335C67", fontWeight: 800, fontSize: 24 }} className="mb-1 flex items-center gap-2">
            <Sparkles className="text-[#E09F3E]" size={24} /> IA Chef
          </h2>
          <p className="text-[#5a8a96] text-sm mb-6">Genera recetas basadas en tu alacena</p>

          <div id="tour-recipes-servings" className="p-4 rounded-2xl mb-4 bg-[#FFFAE6] border border-[#335C67]/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5 font-bold text-[#335C67] text-sm"><Users size={16} /> Porciones</div>
              <span className="px-3 py-1 rounded-full bg-[#335C67] text-[#FFF3B0] font-mono font-bold">{servings}</span>
            </div>
            <input type="range" min={1} max={10} value={servings} onChange={(e) => setServings(Number(e.target.value))} className="w-full accent-[#9E2A2B] h-1" />
            <div className="flex justify-between text-xs text-gray-400 mt-2"><span>1 mín</span><span>10 max</span></div>
          </div>

          <button
            id="tour-recipes-filters"
            onClick={() => setDrawerOpen(true)}
            className="flex items-center justify-between w-full px-4 py-3.5 rounded-2xl bg-white border border-[#335C67]/20 hover:bg-gray-50 transition-colors mb-4"
          >
            <div className="flex items-center gap-2 font-bold text-[#335C67] text-sm"><SlidersHorizontal size={16} /> Filtros Avanzados</div>
            <div className="flex items-center gap-2">
              {totalFilters > 0 && <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#9E2A2B] text-white text-xs font-bold">{totalFilters}</span>}
              <ChevronDown size={16} className="text-[#5a8a96]" />
            </div>
          </button>

          {/* CHIPS DE FILTROS ACTIVOS CON BOTÓN PARA BORRAR */}
          {totalFilters > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              {Object.entries(selectedFilters).flatMap(([cat, vals]) =>
                vals.map((v) => (
                  <span key={`${cat}-${v}`} className="flex items-center gap-1 px-3 py-1 rounded-full text-xs bg-[#335C67] text-white font-bold shadow-sm">
                    {v} <button onClick={() => toggleFilter(cat, v)}><X size={12} className="opacity-70 hover:opacity-100" /></button>
                  </span>
                ))
              )}
              <button 
                onClick={clearFilters} 
                className="text-xs font-bold text-[#9E2A2B] underline hover:text-[#7d2122] transition-colors ml-1"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* BOTÓN GENERAR (YA SIN CÁMARA) */}
          <div className="flex gap-2">
            <button id="tour-recipes-generate" onClick={handleGenerate} disabled={generating} className="w-full py-3.5 rounded-2xl bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50">
              {generating ? <><Loader2 className="animate-spin" size={20} /> Pensando recetas...</> : "Generar Recetas"}
            </button>
          </div>
        </div>

        {/* HISTORIAL */}
        <h3 className="font-bold text-[#335C67] mt-2 flex items-center gap-2"><History size={16}/> Historial de IA</h3>
        
        {/* CONTENEDOR DE LISTA CON PADDING PARA EVITAR CORTES DE BORDE */}
        <div id="tour-recipes-history" className="flex flex-col gap-4 px-2 py-1 pb-4">
          {recipes.length === 0 && <p className="text-sm text-gray-500 bg-white p-4 rounded-xl text-center shadow-sm border border-gray-100">No hay recetas generadas aún.</p>}
          {recipes.map((recipe, idx) => (
            <div key={idx} className="relative group">
              <button
                onClick={() => setSelectedRecipe(recipe)}
                className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border-2 ${recipe.db_id === selectedRecipe?.db_id ? 'border-[#E09F3E] shadow-md bg-white scale-[1.02]' : 'border-transparent bg-white hover:border-[#335C67]/20 hover:shadow-sm'}`}
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden relative shrink-0">
                  <img src="/img/mosaicos.png" alt="Mosaicos" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <img src={recipe.image} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                </div>
                <div className="flex-1 min-w-0 pr-10">
                  <div className="font-bold text-[#335C67] text-[15px] leading-tight mb-1 truncate w-full">{recipe.name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="flex items-center gap-1 text-[#5a8a96] text-xs"><Clock size={12} />{recipe.time}m</span>
                    <span className="flex items-center gap-1 text-[#E09F3E] text-xs font-bold"><Users size={12} />{recipe.servings} px</span>
                  </div>
                </div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe); }} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full bg-white/90 hover:bg-gray-100 shadow-sm border border-gray-100 transition-all z-10 hover:scale-110">
                <Heart size={18} fill={recipe.is_favorite ? "#9E2A2B" : "transparent"} color={recipe.is_favorite ? "#9E2A2B" : "#5a8a96"} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLUMNA DERECHA (VISTA DE RECETA EXPANDIDA) ── */}
      <div id="tour-recipes-main-view" className="flex-1 flex flex-col lg:h-[calc(100vh-6rem)] lg:sticky lg:top-8">
        {selectedRecipe ? (
          <div className="bg-white rounded-3xl overflow-y-auto overflow-x-hidden shadow-sm border border-[#335C67]/10 h-full flex flex-col relative">
            <div className="relative h-80 w-full flex-shrink-0 group overflow-hidden">
              <img src="/img/mosaicos.png" alt="Patrón decorativo" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
              <img src={selectedRecipe.image} alt={selectedRecipe.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
              
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e33] via-[#1a2e33]/60 to-transparent flex flex-col justify-end p-8 lg:p-12">
                
                {/* Botón de Favorito Grande */}
                <button 
                  onClick={() => toggleFavorite(selectedRecipe)} 
                  className="absolute top-6 right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all z-10"
                >
                  <Heart size={24} fill={selectedRecipe.is_favorite ? "#9E2A2B" : "transparent"} color={selectedRecipe.is_favorite ? "#9E2A2B" : "#fff"} />
                </button>

                <div className="flex flex-wrap gap-2 mb-3">
                  {selectedRecipe.tags?.map((tag: string) => (
                    <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E09F3E]/90 text-white backdrop-blur-md shadow-sm">{tag}</span>
                  ))}
                </div>
                <h2 className="text-3xl lg:text-4xl font-serif font-bold text-white mb-4 shadow-sm">{selectedRecipe.name}</h2>
                <div className="flex items-center gap-4 text-white text-sm font-medium">
                  <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg"><Clock size={16} color="#E09F3E"/> {selectedRecipe.time} min</span>
                  <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg"><Users size={16} color="#E09F3E"/> {selectedRecipe.servings} porciones</span>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 grid xl:grid-cols-3 gap-10 flex-1">
              <div className="xl:col-span-2">
                <p className="text-[#5a8a96] leading-relaxed mb-10 text-lg font-medium">{selectedRecipe.description}</p>
                
                <div className="mb-10 p-8 bg-[#FFFAE6] rounded-3xl border border-[#E09F3E]/20 shadow-inner">
                  <h3 className="font-serif text-xl font-bold text-[#335C67] mb-4">Ingredientes ({selectedRecipe.servings} porciones)</h3>
                  <h4 className="text-sm font-bold text-[#335C67] mb-2 uppercase opacity-70">En tu Alacena:</h4>
                  <ul className="space-y-3 mb-6">
                    {selectedRecipe.ownedIngredients?.map((ing: any, i:number) => (
                      <li key={i} className="flex items-start gap-2 text-[#335C67] font-medium"><CheckCircle2 size={18} color="#E09F3E" className="mt-0.5 shrink-0"/> {ing.qty} {ing.unit} {ing.name}</li>
                    ))}
                  </ul>

                  {selectedRecipe.missingIngredients?.length > 0 && (
                    <>
                      <h4 className="text-sm font-bold text-[#9E2A2B] mb-2 uppercase flex items-center gap-1 opacity-90"><AlertCircle size={14}/> Faltantes (Sugeridos):</h4>
                      <ul className="space-y-3">
                        {selectedRecipe.missingIngredients.map((ing: any, i:number) => (
                          <li key={i} className="flex items-start gap-2 text-[#9E2A2B] font-medium"><ShoppingCart size={18} className="mt-0.5 shrink-0 opacity-70"/> {ing.qty} {ing.unit} {ing.name}</li>
                        ))}
                      </ul>
                    </>
                  )}
                </div>
                
                <h3 className="font-serif text-2xl font-bold text-[#335C67] mb-6">Instrucciones</h3>
                <div className="space-y-4">
                  {selectedRecipe.steps?.map((step: any, idx: number) => {
                    return (
                      <div key={step.step || idx} className="flex gap-4 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm transition-all hover:border-[#E09F3E]/40">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-[#335C67] text-white">
                          {step.step || (idx + 1)}
                        </div>
                        <div>
                          <h4 className="font-bold mb-1.5 text-[#335C67]">{step.title || `Paso ${step.step || idx + 1}`}</h4>
                          <p className="text-sm leading-relaxed text-[#5a8a96]">{step.instruction}</p>
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-[#E09F3E] font-bold">
                            <Clock size={12} /> {step.time} min
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-6">
                <CookingTimer defaultMinutes={selectedRecipe.time || 30} />

                <div className="bg-white rounded-3xl p-6 border border-[#335C67]/10 shadow-sm text-center">
                  <h3 className="font-bold text-[#335C67] mb-4 text-lg">¿Todo listo?</h3>
                      <Link 
                        href="/dashboard/cook"
                        className="w-full py-4 rounded-2xl bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                    <Flame size={20} /> ¡A Cocinar!
                  </Link>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#335C67]/10 shadow-sm">
                  <h3 className="font-bold text-[#335C67] mb-5 flex items-center gap-2"><Sparkles size={18} color="#E09F3E"/> Info Nutricional</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium">Calorías</div>
                      <div className="font-bold text-[#9E2A2B] text-xl">{selectedRecipe.nutrition?.calorias || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium">Proteína</div>
                      <div className="font-bold text-[#335C67] text-xl">{selectedRecipe.nutrition?.proteina || "0g"}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium">Carbs</div>
                      <div className="font-bold text-[#E09F3E] text-xl">{selectedRecipe.nutrition?.carbohidratos || "0g"}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium">Grasas</div>
                      <div className="font-bold text-[#5a8a96] text-xl">{selectedRecipe.nutrition?.grasas || "0g"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-full bg-white/50 rounded-3xl border-2 border-dashed border-[#335C67]/20 flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <ChefHat size={64} className="text-[#335C67]/20 mb-4" />
            <h2 className="text-2xl font-serif font-bold text-[#335C67] mb-2">Tu cocina está lista</h2>
            <p className="text-[#5a8a96] max-w-md">Abre el menú de "Filtros Avanzados", selecciona tus preferencias y deja que la IA genere magia con tu alacena.</p>
          </div>
        )}
      </div>

      <FiltersDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} selected={selectedFilters} onToggle={toggleFilter} onClear={clearFilters} />
    </div>
  );
}