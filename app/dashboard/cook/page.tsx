'use client';

import { useState, useEffect, useMemo } from "react";
import { Clock, Users, Search, AlertCircle, CheckCircle2, History, Heart, Flame, ChefHat, ShoppingCart, Sparkles, Plus, Minus, Loader2, AlertTriangle, X } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { InteractiveTimer } from "../../components/cook/InteractiveTimer";
import { GuidedCookingModal } from "../../components/cook/GuidedCookingModal";

export default function HistoryView() {
  const supabase = createClient();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [pantry, setPantry] = useState<any[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"historial" | "favoritos">("historial");
  const [activeStep, setActiveStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  
  const [isCooking, setIsCooking] = useState(false);
  const [displayServings, setDisplayServings] = useState(2);
  
  // ESTADO DE CARGA INICIAL
  const [isLoading, setIsLoading] = useState(true);

  // ─── ESTADOS NUEVOS: TOAST Y MODAL DE FALTANTES ───
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'warning'}>({ show: false, message: "", type: "success" });
  const [showMissingModal, setShowMissingModal] = useState(false);
  const [isAutocompleting, setIsAutocompleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => { loadHistory(true); }, []);

  const loadHistory = async (showLoader = false) => {
    if (showLoader) setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data: pantryData } = await supabase.from('pantry_items').select('*').eq('user_id', user.id);
      setPantry(pantryData || []);

      const { data } = await supabase.from('saved_recipes').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      if (data && data.length > 0) {
        const parsedRecipes = data.map(r => ({ db_id: r.id, is_favorite: r.is_favorite, ...r.recipe_data }));
        setRecipes(parsedRecipes);
        setRecipes(currentRecipes => {
          if(!selectedRecipe && parsedRecipes.length > 0) {
             setSelectedRecipe(parsedRecipes[0]);
             setDisplayServings(parsedRecipes[0].servings || 2);
          }
          return parsedRecipes;
        });
      }
    } catch (error) {
      console.error("Error al cargar datos:", error);
    } finally {
      if (showLoader) setIsLoading(false);
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

  const toggleStep = (idx: number) => {
    setCompletedSteps((prev) => prev.includes(idx) ? prev.filter((s) => s !== idx) : [...prev, idx]);
  };

  const liveRecipe = useMemo(() => {
    if (!selectedRecipe) return null;
    const multiplier = displayServings / (selectedRecipe.servings || 1);
    
    const allIngredients = [...(selectedRecipe.ownedIngredients || []), ...(selectedRecipe.missingIngredients || [])];
    const liveOwned: any[] = [];
    const liveMissing: any[] = [];

    allIngredients.forEach(ing => {
      const reqQty = (parseFloat(ing.qty) || 1) * multiplier;
      const cleanName = ing.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      
      const inPantry = pantry.find(p => {
         const pName = p.ingredient_name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
         return pName.includes(cleanName) || cleanName.includes(pName);
      });

      const updatedIng = { ...ing, qty: Number.isInteger(reqQty) ? reqQty : reqQty.toFixed(1) };
      if (inPantry) liveOwned.push(updatedIng);
      else liveMissing.push(updatedIng);
    });

    const scaleNutrition = (str: string) => {
        if (!str) return str;
        const val = parseFloat(str.replace(/[^0-9.]/g, ''));
        const unit = str.replace(/[0-9.]/g, '');
        if (isNaN(val)) return str;
        const scaled = val * multiplier;
        return `${Number.isInteger(scaled) ? scaled : scaled.toFixed(1)}${unit}`;
    };

    return {
      ...selectedRecipe,
      servings: displayServings,
      ownedIngredients: liveOwned,
      missingIngredients: liveMissing,
      nutrition: selectedRecipe.nutrition ? {
        calorias: scaleNutrition(String(selectedRecipe.nutrition.calorias)),
        proteina: scaleNutrition(String(selectedRecipe.nutrition.proteina)),
        carbohidratos: scaleNutrition(String(selectedRecipe.nutrition.carbohidratos)),
        grasas: scaleNutrition(String(selectedRecipe.nutrition.grasas))
      } : null
    };
  }, [selectedRecipe, displayServings, pantry]);

  const filteredRecipes = recipes.filter(r => {
    const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase()) || r.tags?.some((t:string) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (activeTab === "historial" ? true : r.is_favorite);
  });

  const currentStepTime = liveRecipe?.steps?.[Math.min(activeStep, liveRecipe.steps.length - 1)]?.time || 5;

  // ─── LÓGICA DE INTERCEPCIÓN PARA COCINAR ───
  const handleStartCooking = () => {
    if (liveRecipe?.missingIngredients?.length > 0) {
      setShowMissingModal(true);
    } else {
      setIsCooking(true);
    }
  };

  const handleCancelCooking = () => {
    setShowMissingModal(false);
    showToast("Operación cancelada. ¡Consigue los ingredientes primero!", "warning");
  };

  const handleAutocompleteAndCook = async () => {
    setIsAutocompleting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Nombres existentes para evitar duplicados al clasificar
      const existingNames = pantry.map(p => p.ingredient_name);

      // Usamos Promise.all para clasificar TODOS los faltantes en paralelo usando la IA
      const classifiedItemsPromises = liveRecipe.missingIngredients.map(async (ing: any) => {
        const qtyFloat = parseFloat(ing.qty) || 1;
        const roundedQty = Math.ceil(qtyFloat); // Redondeo al entero superior
        
        // Valores por defecto en caso de que la IA tarde o falle
        let category = "Otros";
        let icon = "🛒";
        let location = "Alacena";
        let daysToExpire = 7;
        let correctedName = ing.name;

        try {
          const response = await fetch('/api/classify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ingredient: ing.name, existingPantry: existingNames }),
          });
          const data = await response.json();
          
          if (data?.category) {
            category = data.category;
            icon = data.icon || icon;
            location = data.location || location;
            daysToExpire = data.daysToExpire || daysToExpire;
            correctedName = data.correctedName || correctedName;
          }
        } catch (error) {
          console.error(`Error al clasificar ${ing.name} con IA. Usando valores por defecto.`);
        }

        // Calculamos la fecha real de caducidad basada en la IA
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + daysToExpire);

        return {
          user_id: user.id,
          ingredient_name: correctedName,
          quantity: roundedQty,
          unit: ing.unit || "pzas",
          category: category, 
          expiration_date: expirationDate.toISOString().split('T')[0],
          icon: icon,
          location: location,
          status: "good"
        };
      });

      // Esperamos a que la IA clasifique todos los faltantes
      const newPantryItems = await Promise.all(classifiedItemsPromises);

      // Insertar masivamente en Supabase
      const { error } = await supabase.from('pantry_items').insert(newPantryItems);
      if (error) throw error;

      showToast("Ingredientes procesados por IA y agregados. ¡A cocinar!", "success");
      setShowMissingModal(false);
      
      // Recargar alacena para que el GuidedCookingModal pueda hacer los descuentos reales
      await loadHistory(false);
      setIsCooking(true);

    } catch (error) {
      console.error(error);
      showToast("Hubo un error al autocompletar los ingredientes.", "error");
    } finally {
      setIsAutocompleting(false);
    }
  };

  // PANTALLA DE CARGA PRINCIPAL
  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-[#FFFAE6]">
        <Loader2 className="animate-spin text-[#E09F3E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-[#335C67] animate-pulse">Preparando tu cocina...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 pb-10 font-sans min-h-screen bg-[#FFFAE6] relative">

      {/* ── TOAST NOTIFICATION ── */}
      <div 
        className={`fixed top-8 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl transition-all duration-300 ease-out transform ${
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

      {/* ── MODAL DE INGREDIENTES FALTANTES ── */}
      {showMissingModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm">
          <div className="bg-[#FFFAE6] rounded-3xl p-8 w-full max-w-md shadow-2xl text-center relative animate-in fade-in zoom-in duration-200">
            <button onClick={() => setShowMissingModal(false)} className="absolute top-4 right-4 p-2 hover:bg-black/5 rounded-full transition-colors"><X size={20} className="text-[#5a8a96]"/></button>
            <div className="w-20 h-20 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-6">
              <ShoppingCart size={40} className="text-[#E09F3E]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#335C67] mb-4">Te faltan {liveRecipe?.missingIngredients?.length} ingredientes</h3>
            <p className="text-[#5a8a96] font-medium mb-2">Para preparar <strong className="text-[#335C67]">{liveRecipe?.name}</strong> faltan ingredientes en tu alacena.</p>
            <p className="text-xs text-[#b87d2a] bg-orange-50 p-3 rounded-xl border border-orange-100 mb-8">
              ¿Deseas que la IA agregue los ingredientes faltantes a tu alacena (redondeando hacia arriba) para poder cocinar inmediatamente?
            </p>
            <div className="flex flex-col gap-3">
              <button onClick={handleAutocompleteAndCook} disabled={isAutocompleting} className="w-full py-3.5 rounded-2xl bg-[#E09F3E] text-white font-bold shadow-lg hover:bg-[#c98a30] transition-colors flex justify-center items-center gap-2">
                {isAutocompleting ? <Loader2 className="animate-spin" size={20}/> : <><Sparkles size={20} /> Sí, autocompletar e iniciar</>}
              </button>
              <button onClick={handleCancelCooking} disabled={isAutocompleting} className="w-full py-3.5 rounded-2xl bg-white border border-[#335C67]/20 text-[#335C67] font-bold hover:bg-gray-50 transition-colors">
                No, los conseguiré primero
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── COLUMNA IZQUIERDA ── */}
      <div className="w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col gap-6 lg:h-[calc(100vh-6rem)] lg:sticky lg:top-8 overflow-y-auto overflow-x-hidden scrollbar-hide">
        <div className="bg-white p-2 rounded-2xl border border-[#335C67]/10 shadow-sm flex items-center gap-2 focus-within:border-[#E09F3E] transition-colors">
          <Search className="ml-3 text-[#5a8a96]" size={20} />
          <input type="text" placeholder="Buscar recetas, ingredientes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-transparent outline-none p-2 text-[#335C67] placeholder:text-gray-400 font-medium" />
        </div>

        <div className="flex bg-white rounded-2xl p-1 border border-[#335C67]/10 shadow-sm">
          <button onClick={() => setActiveTab("historial")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "historial" ? 'bg-[#335C67] text-white shadow-md' : 'text-[#5a8a96] hover:bg-gray-50'}`}><History size={16} /> Historial</button>
          <button onClick={() => setActiveTab("favoritos")} className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === "favoritos" ? 'bg-[#9E2A2B] text-white shadow-md' : 'text-[#5a8a96] hover:bg-gray-50'}`}><Heart size={16} /> Favoritos</button>
        </div>

        {/* CONTENEDOR DE LISTA CON PADDING PARA EVITAR CORTES DE BORDE */}
        <div className="flex flex-col gap-4 px-2 py-1 pb-4">
          {filteredRecipes.length === 0 && (
            <p className="text-sm text-gray-500 bg-white p-6 rounded-2xl text-center shadow-sm border border-gray-100">
              No se encontraron recetas {activeTab === "favoritos" && "favoritas"} con esa búsqueda.
            </p>
          )}
          {filteredRecipes.map((recipe, idx) => (
            <div key={idx} className="relative group">
              <button
                onClick={() => { setSelectedRecipe(recipe); setDisplayServings(recipe.servings || 2); setActiveStep(0); setCompletedSteps([]); setIsCooking(false); }}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl text-left transition-all border-2 ${recipe.db_id === selectedRecipe?.db_id ? 'border-[#E09F3E] shadow-md bg-white scale-[1.02]' : 'border-transparent bg-white hover:border-[#335C67]/20 hover:shadow-sm'}`}
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden relative shrink-0">
                  <img src="/img/mosaicos.png" alt="Mosaicos" className="absolute inset-0 w-full h-full object-cover opacity-80" />
                  <img src={recipe.image} alt={recipe.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
                </div>
                <div className="flex-1 min-w-0 pr-10">
                  <div className="font-bold text-[#335C67] text-[15px] leading-tight mb-1 truncate w-full">{recipe.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-[#5a8a96] text-xs font-medium"><Clock size={12} />{recipe.time}m</span>
                    <span className="flex items-center gap-1 text-[#E09F3E] text-xs font-bold"><Users size={12} />{recipe.servings} px</span>
                  </div>
                </div>
              </button>
              <button onClick={(e) => { e.stopPropagation(); toggleFavorite(recipe); }} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 rounded-full bg-white/90 hover:bg-gray-100 shadow-sm border border-gray-100 transition-all z-10 hover:scale-110">
                <Heart size={20} fill={recipe.is_favorite ? "#9E2A2B" : "transparent"} color={recipe.is_favorite ? "#9E2A2B" : "#5a8a96"} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── COLUMNA DERECHA ── */}
      <div className="flex-1 flex flex-col lg:h-[calc(100vh-6rem)] lg:sticky lg:top-8">
        {isCooking && liveRecipe ? (
          /* MODO DE COCINA GUIADA IN-PLACE */
          <GuidedCookingModal recipe={liveRecipe} onClose={() => { setIsCooking(false); loadHistory(false); }} />
        ) : liveRecipe ? (
          /* VISTA NORMAL DE RECETA EXPANDIDA */
          <div className="bg-white rounded-3xl overflow-y-auto overflow-x-hidden shadow-sm border border-[#335C67]/10 h-full flex flex-col relative">
            <div className="relative h-80 w-full flex-shrink-0 group overflow-hidden">
              <img src="/img/mosaicos.png" alt="Mosaico" className="absolute inset-0 w-full h-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105" />
              <img src={liveRecipe.image} alt={liveRecipe.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1a2e33] via-[#1a2e33]/60 to-transparent flex flex-col justify-end p-8 lg:p-12">
                <button onClick={() => toggleFavorite(selectedRecipe)} className="absolute top-6 right-6 p-3 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-md transition-all z-10">
                  <Heart size={24} fill={selectedRecipe.is_favorite ? "#9E2A2B" : "transparent"} color={selectedRecipe.is_favorite ? "#9E2A2B" : "#fff"} />
                </button>
                <div className="flex flex-wrap gap-2 mb-4">
                  {liveRecipe.tags?.map((tag: string) => <span key={tag} className="px-4 py-1.5 rounded-full text-xs font-bold bg-[#E09F3E]/90 text-white shadow-sm">{tag}</span>)}
                </div>
                <h2 className="text-4xl lg:text-5xl font-serif font-bold text-white mb-4 shadow-sm leading-tight">{liveRecipe.name}</h2>
                <div className="flex items-center gap-4 text-white text-sm font-medium">
                  <span className="flex items-center gap-2 bg-black/40 px-3 py-1.5 rounded-lg"><Clock size={16} color="#E09F3E"/> {liveRecipe.time} min</span>
                  
                  {/* Selector Dinámico de Porciones */}
                  <div className="flex items-center gap-3 bg-black/50 px-4 py-1.5 rounded-lg border border-white/20">
                    <Users size={16} color="#E09F3E"/> 
                    <button onClick={() => setDisplayServings(Math.max(1, displayServings - 1))} className="hover:text-[#E09F3E] transition-colors"><Minus size={14}/></button>
                    <span className="w-5 text-center font-bold text-base">{displayServings}</span>
                    <button onClick={() => setDisplayServings(displayServings + 1)} className="hover:text-[#E09F3E] transition-colors"><Plus size={14}/></button>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 lg:p-12 grid xl:grid-cols-3 gap-12 flex-1">
              <div className="xl:col-span-2">
                <p className="text-[#5a8a96] leading-relaxed mb-10 text-lg font-medium">{liveRecipe.description}</p>
                <div className="mb-10 p-8 bg-[#FFFAE6] rounded-3xl border border-[#E09F3E]/20 shadow-inner">
                  <h3 className="font-serif text-2xl font-bold text-[#335C67] mb-6 flex items-center gap-2"><CheckCircle2 color="#E09F3E"/> Ingredientes calculados</h3>
                  <div className="grid sm:grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-bold text-[#335C67] mb-4 uppercase opacity-70">En tu Alacena</h4>
                      <ul className="space-y-4">
                        {liveRecipe.ownedIngredients?.map((ing: any, i:number) => (
                          <li key={i} className="flex items-start gap-3 text-[#335C67] font-medium bg-white p-3 rounded-2xl shadow-sm border border-gray-100">
                            <CheckCircle2 size={20} color="#E09F3E" className="mt-0.5 shrink-0"/> <div><span className="font-bold">{ing.qty} {ing.unit}</span> <br/>{ing.name}</div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {liveRecipe.missingIngredients?.length > 0 && (
                      <div>
                        <h4 className="text-xs font-bold text-[#9E2A2B] mb-4 uppercase opacity-90 flex items-center gap-1"><AlertCircle size={14}/> Faltantes</h4>
                        <ul className="space-y-4">
                          {liveRecipe.missingIngredients.map((ing: any, i:number) => (
                            <li key={i} className="flex items-start gap-3 text-[#9E2A2B] font-medium bg-white p-3 rounded-2xl shadow-sm border border-red-50">
                              <ShoppingCart size={20} className="mt-0.5 shrink-0 opacity-70"/> <div><span className="font-bold">{ing.qty} {ing.unit}</span> <br/>{ing.name}</div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                
                <h3 className="font-serif text-3xl font-bold text-[#335C67] mb-8">Preparación</h3>
                <div className="space-y-4">
                  {liveRecipe.steps?.map((step: any, idx: number) => {
                    const isDone = completedSteps.includes(idx);
                    const isActive = idx === activeStep && !isDone;
                    return (
                      <div key={idx} onClick={() => { setActiveStep(idx); toggleStep(idx); }} className={`flex gap-5 p-6 rounded-3xl cursor-pointer transition-all border-2 ${isDone ? 'bg-gray-50 border-transparent opacity-60' : isActive ? 'bg-white border-[#E09F3E] shadow-lg scale-[1.02]' : 'bg-white border-gray-100 hover:border-[#E09F3E]/40'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-base shrink-0 shadow-sm ${isDone ? 'bg-[#335C67] text-white' : isActive ? 'bg-[#E09F3E] text-white' : 'bg-gray-100 text-[#335C67]'}`}>
                          {isDone ? <CheckCircle2 size={20} /> : (step.step || idx + 1)}
                        </div>
                        <div className="flex-1">
                          <h4 className={`font-bold text-lg mb-2 ${isDone ? 'line-through text-gray-500' : 'text-[#335C67]'}`}>{step.title || `Paso ${step.step || idx + 1}`}</h4>
                          <p className={`text-base leading-relaxed ${isDone ? 'text-gray-400' : 'text-[#5a8a96]'}`}>{step.instruction}</p>
                          <span className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#E09F3E] font-bold bg-[#E09F3E]/10 px-3 py-1 rounded-full"><Clock size={14} /> {step.time} min</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-8">
                <div className="bg-[#1a2e33] rounded-3xl p-8 shadow-xl text-center relative overflow-hidden">
                   <div className="absolute top-0 right-0 -mr-4 -mt-4 opacity-10"><ChefHat size={120} color="#fff"/></div>
                   <h3 className="font-bold text-white mb-6 text-xl relative z-10">¿Listo para la acción?</h3>
                   
                   {/* ─── BOTÓN MODIFICADO PARA INTERCEPTAR ─── */}
                   <button onClick={handleStartCooking} className="w-full py-5 rounded-2xl bg-[#E09F3E] hover:bg-[#c98a30] text-white text-lg font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:scale-105 relative z-10">
                     <Flame size={24} /> Iniciar Cocina
                   </button>

                   <p className="text-white/60 text-xs mt-4 relative z-10">Esto descontará los ingredientes ({displayServings} pax) de tu alacena al finalizar.</p>
                </div>

                <InteractiveTimer defaultMinutes={currentStepTime} />

                <div className="p-6 rounded-3xl bg-white border border-[#335C67]/10 shadow-sm">
                  <div className="text-xs font-bold text-[#5a8a96] tracking-wider mb-4">PROGRESO ACTUAL</div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#335C67] font-bold">Paso {completedSteps.length} de {liveRecipe.steps.length}</span>
                    <span className="font-mono text-sm text-[#9E2A2B] font-bold">{Math.round((completedSteps.length / liveRecipe.steps.length) * 100)}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-gray-100 overflow-hidden"><div className="h-full bg-[#9E2A2B] transition-all duration-500" style={{ width: `${(completedSteps.length / liveRecipe.steps.length) * 100}%` }} /></div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#335C67]/10 shadow-sm">
                  <h3 className="font-bold text-[#335C67] mb-5 flex items-center gap-2"><Sparkles size={18} color="#E09F3E"/> Info Nutricional ({displayServings} pax)</h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-[#FFFAE6] p-4 rounded-2xl text-center border border-[#E09F3E]/20">
                      <div className="text-[#5a8a96] mb-1 font-medium text-xs uppercase">Calorías</div>
                      <div className="font-bold text-[#9E2A2B] text-xl">{liveRecipe.nutrition?.calorias || 0}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium text-xs uppercase">Proteína</div>
                      <div className="font-bold text-[#335C67] text-xl">{liveRecipe.nutrition?.proteina || "0g"}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium text-xs uppercase">Carbs</div>
                      <div className="font-bold text-[#E09F3E] text-xl">{liveRecipe.nutrition?.carbohidratos || "0g"}</div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl text-center border border-gray-100">
                      <div className="text-[#5a8a96] mb-1 font-medium text-xs uppercase">Grasas</div>
                      <div className="font-bold text-[#5a8a96] text-xl">{liveRecipe.nutrition?.grasas || "0g"}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full h-[80vh] bg-white/50 rounded-3xl border-2 border-dashed border-[#335C67]/20 flex flex-col items-center justify-center p-12 text-center shadow-sm">
            <ChefHat size={80} className="text-[#335C67]/20 mb-6" />
            <h2 className="text-3xl font-serif font-bold text-[#335C67] mb-3">Tu Historial de Cocina</h2>
            <p className="text-[#5a8a96] max-w-md text-lg">Busca recetas anteriores o revisa tus platos favoritos para cocinarlos de nuevo.</p>
          </div>
        )}
      </div>
    </div>
  );
}