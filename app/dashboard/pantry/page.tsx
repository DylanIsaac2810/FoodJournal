'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, BookOpen, AlertTriangle, Loader2, Sparkles, X, Trash2, CheckCircle2, AlertCircle } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { NotificationBell } from "@/app/components/pantry/NotificationBell";
import { PantryItemCard } from "@/app/components/pantry/PantryItemCard";
import { OnboardingModal } from "@/app/components/auth/OnboardingModal";

const categories = ["Todo", "Vegetales", "Frutas", "Lácteos", "Granos", "Proteínas", "Condimentos"];
const locations = ["Refrigerador", "Alacena", "Congelador"];
const units = ["g", "kg", "ml", "L", "pzas", "manojo", "paquete"];

const initialItemState = { 
  id: null, name: "", quantity: "", unit: "pzas", expires: "", category: "Vegetales", location: "Refrigerador", icon: "🛒" 
};

export default function PantryDashboard() {
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modal y Edición
  const [showAddModal, setShowAddModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newItem, setNewItem] = useState<any>(initialItemState);
  
  // Estados de Notificaciones (Custom Alerts)
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'warning'}>({ show: false, message: "", type: "success" });
  const [confirmDialog, setConfirmDialog] = useState<{show: boolean, message: string, onConfirm: () => void}>({ show: false, message: "", onConfirm: () => {} });

  // Estados para Onboarding y Carga Inicial
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pantryItems, setPantryItems] = useState<any[]>([]); 

  const supabase = createClient();

  // Función para mostrar notificaciones bonitas
  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  const loadDashboardData = async () => {
    setIsLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).maybeSingle();

    if (!profile || !profile.onboarding_completed) {
      setShowOnboarding(true);
    }

    const { data: items } = await supabase.from('pantry_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      
    setPantryItems(items || []);
    setIsLoading(false);
  };

  useEffect(() => { loadDashboardData(); }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    loadDashboardData();
  };

  const openAddModal = () => {
    setIsEditing(false);
    setNewItem(initialItemState);
    setShowAddModal(true);
  };

  const openEditModal = (item: any) => {
    setIsEditing(true);
    setNewItem({
      id: item.id,
      name: item.ingredient_name,
      quantity: item.quantity.toString(),
      unit: item.unit,
      expires: item.expiration_date,
      category: item.category,
      location: item.location,
      icon: item.icon
    });
    setShowAddModal(true);
  };

  const handleAutoClassify = async () => {
    if (!newItem.name.trim()) return showToast("Primero escribe el nombre del alimento", "warning");
    setIsClassifying(true);
    try {
      const existingNames = pantryItems.map(i => i.ingredient_name);
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: newItem.name, existingPantry: existingNames }),
      });
      const data = await response.json();
      
      if (data?.category) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (data.daysToExpire || 7));
        
        setNewItem((prev: any) => ({
          ...prev, 
          name: data.correctedName || prev.name, 
          category: data.category, 
          icon: data.icon || "📦", 
          location: data.location || "Alacena", 
          expires: isEditing && prev.expires ? prev.expires : expirationDate.toISOString().split('T')[0]
        }));
        showToast("¡Ingrediente clasificado por IA!", "success");
      }
    } catch (error) {
      showToast("Hubo un error al clasificar con IA.", "error");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.expires) return showToast("Llena nombre, cantidad y caducidad.", "warning");
    const numericQuantity = parseFloat(newItem.quantity);
    if (isNaN(numericQuantity) || numericQuantity < 0) return showToast("La cantidad debe ser un número válido.", "warning");

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const cleanName = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
      const inputCleanName = cleanName(newItem.name);
      const existingItem = pantryItems.find(item => cleanName(item.ingredient_name) === inputCleanName);

      const itemData = {
        ingredient_name: newItem.name,
        quantity: numericQuantity,
        unit: newItem.unit,
        category: newItem.category,
        expiration_date: newItem.expires,
        icon: newItem.icon,
        location: newItem.location,
      };

      if (isEditing && newItem.id) {
        await supabase.from('pantry_items').update(itemData).eq('id', newItem.id);
        showToast("Cambios guardados con éxito", "success");
      } else if (existingItem) {
        const newTotal = existingItem.quantity + numericQuantity;
        await supabase.from('pantry_items').update({ 
          quantity: newTotal,
          expiration_date: newItem.expires,
          unit: newItem.unit 
        }).eq('id', existingItem.id);
        showToast(`¡Acumulado! Ahora tienes ${newTotal} ${newItem.unit} de ${existingItem.ingredient_name}.`, "success");
      } else {
        await supabase.from('pantry_items').insert({ ...itemData, user_id: user.id, status: "good" });
        showToast("Ingrediente agregado a la alacena", "success");
      }

      setShowAddModal(false);
      loadDashboardData();
    } catch (err) {
      showToast("Hubo un error al guardar en la base de datos.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = () => {
    if (!newItem.id) return;
    setConfirmDialog({
      show: true,
      message: `¿Estás seguro de que quieres eliminar ${newItem.name} de tu alacena?`,
      onConfirm: async () => {
        setConfirmDialog({ ...confirmDialog, show: false });
        setIsDeleting(true);
        try {
          await supabase.from('pantry_items').delete().eq('id', newItem.id);
          setShowAddModal(false);
          loadDashboardData();
          showToast("Ingrediente eliminado", "success");
        } catch (error) {
          showToast("Error al eliminar el ingrediente.", "error");
        } finally {
          setIsDeleting(false);
        }
      }
    });
  };

  const filtered = pantryItems.filter((item) => {
    const matchCategory = activeCategory === "Todo" || item.category === activeCategory;
    const matchSearch = item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const expiringCount = pantryItems.filter((item) => {
    const diffDays = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-[#FFFAE6]">
        <Loader2 className="animate-spin text-[#E09F3E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-[#335C67] animate-pulse">Revisando tu alacena...</h2>
      </div>
    );
  }

  return (
    <div className="relative pb-24">
      
      {/* ── TOAST NOTIFICATION (CUSTOM ALERT) ── */}
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

      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}

      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#335C67]">Mi Alacena Digital</h1>
          <p className="text-[#5a8a96] mt-1">{pantryItems.length} ingredientes registrados</p>
        </div>
        <NotificationBell items={pantryItems} />
      </header>

      {expiringCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-2xl mb-8 bg-[#9E2A2B]/10 border border-[#9E2A2B]/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} color="#9E2A2B" />
            <span className="text-[#9E2A2B] font-semibold text-sm sm:text-base">¡Tienes {expiringCount} artículos que necesitan atención pronto!</span>
          </div>
          <Link href="/dashboard/recipes" className="sm:ml-auto px-5 py-2 rounded-full bg-[#9E2A2B] text-white text-sm font-bold hover:bg-[#7d2122] transition-colors">Usar Ahora</Link>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#335C67]/20 shadow-sm focus-within:border-[#E09F3E] transition-all">
          <Search size={20} color="#5a8a96" />
          <input type="text" placeholder="Buscar ingredientes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 outline-none font-medium text-black placeholder:text-gray-500 placeholder:font-normal" />
        </div>
        <Link href="/dashboard/recipes" className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#335C67] text-[#FFF3B0] font-bold shadow-md hover:bg-[#234149] transition-colors"><BookOpen size={20} /> Generar Recetas</Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${cat === activeCategory ? 'bg-[#9E2A2B] text-white shadow-md' : 'bg-white text-[#335C67] border border-[#335C67]/20 hover:bg-[#335C67]/5'}`}>{cat}</button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#5a8a96] font-medium text-lg">No hay ingredientes encontrados.</div>
        ) : (
          filtered.map((item) => <PantryItemCard key={item.id} item={item} onEdit={openEditModal} />)
        )}
      </div>

      {/* Botón flotante para crear nuevo ingrediente */}
      <button onClick={openAddModal} className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center bg-[#E09F3E] text-white shadow-lg hover:scale-105 transition-all z-40">
        <Plus size={32} />
      </button>

      {/* ── MODAL DE CONFIRMACIÓN DE ELIMINACIÓN ── */}
      {confirmDialog.show && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm">
          <div className="bg-[#FFFAE6] rounded-3xl p-8 w-full max-w-sm shadow-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
              <Trash2 size={40} className="text-[#9E2A2B]" />
            </div>
            <h3 className="font-serif text-2xl font-bold text-[#335C67] mb-4">¿Eliminar ingrediente?</h3>
            <p className="text-[#5a8a96] font-medium mb-8">{confirmDialog.message}</p>
            <div className="flex gap-4">
              <button onClick={() => setConfirmDialog({ ...confirmDialog, show: false })} className="flex-1 py-3.5 rounded-2xl bg-white border border-[#335C67]/20 text-[#335C67] font-bold hover:bg-gray-50 transition-colors">
                Cancelar
              </button>
              <button onClick={confirmDialog.onConfirm} className="flex-1 py-3.5 rounded-2xl bg-[#9E2A2B] text-white font-bold shadow-lg hover:bg-[#7d2122] transition-colors">
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL (CREAR / EDITAR) */}
      {showAddModal && !confirmDialog.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="bg-[#FFFAE6] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#335C67]">
                {isEditing ? "Editar Ingrediente" : "Agregar Ingrediente"}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full"><X size={24} color="#5a8a96" /></button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#335C67] mb-2">Nombre del alimento</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3 text-xl">{newItem.icon}</span>
                    <input type="text" placeholder="Ej. Manzana verde" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} className="w-full pl-12 pr-4 py-3 rounded-xl border border-[#335C67]/20 text-black font-medium outline-none focus:border-[#E09F3E]" />
                  </div>
                  <button type="button" onClick={handleAutoClassify} disabled={isClassifying} className="px-4 py-3 rounded-xl bg-[#335C67] text-[#FFF3B0] font-bold hover:bg-[#234149] disabled:opacity-50">
                    {isClassifying ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#335C67] mb-2">Cant.</label>
                    <input type="number" min="0" step="0.01" value={newItem.quantity} onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none focus:border-[#E09F3E]" />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-bold text-[#335C67] mb-2">Unidad</label>
                    <select value={newItem.unit} onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })} className="w-full px-2 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none">
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Caducidad</label>
                  <input type="date" value={newItem.expires} onChange={(e) => setNewItem({ ...newItem, expires: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Categoría</label>
                  <select value={newItem.category} onChange={(e) => setNewItem({ ...newItem, category: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none">
                    {categories.filter(c => c !== "Todo").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Ubicación</label>
                  <select value={newItem.location} onChange={(e) => setNewItem({ ...newItem, location: e.target.value })} className="w-full px-4 py-3 rounded-xl border border-[#335C67]/20 text-black outline-none">
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button type="button" onClick={handleSaveItem} disabled={isSaving} className="w-full py-4 bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold rounded-xl flex justify-center gap-2 transition-colors shadow-md">
                  {isSaving ? <Loader2 size={24} className="animate-spin" /> : (isEditing ? "Guardar Cambios" : "Guardar en Alacena")}
                </button>
                
                {isEditing && (
                  <button type="button" onClick={confirmDelete} disabled={isDeleting} className="w-full py-3 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex justify-center gap-2 transition-colors">
                    {isDeleting ? <Loader2 size={20} className="animate-spin" /> : <><Trash2 size={20} /> Eliminar </>}
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}