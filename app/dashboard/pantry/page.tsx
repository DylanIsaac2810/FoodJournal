'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, BookOpen, AlertTriangle, Loader2, Sparkles, X } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { NotificationBell } from "@/components/pantry/NotificationBell";
import { PantryItemCard } from "@/components/pantry/PantryItemCard";

const categories = ["Todo", "Vegetales", "Frutas", "Lácteos", "Granos", "Proteínas", "Condimentos"];
const locations = ["Refrigerador", "Alacena", "Congelador"];
const units = ["g", "kg", "ml", "L", "pzas", "manojo", "paquete"];

export default function PantryDashboard() {
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pantryItems, setPantryItems] = useState<any[]>([]); 

  const supabase = createClient();

  const [newItem, setNewItem] = useState({ 
    name: "", quantity: "", unit: "pzas", expires: "", category: "Vegetales", location: "Refrigerador", icon: "🛒" 
  });

  const fetchPantryItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('pantry_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setPantryItems(data || []);
  };

  useEffect(() => { fetchPantryItems(); }, []);

  const handleAutoClassify = async () => {
    if (!newItem.name.trim()) return alert("⚠️ Primero escribe el nombre del alimento");
    setIsClassifying(true);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: newItem.name }),
      });
      const data = await response.json();
      if (data?.category) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (data.daysToExpire || 7));
        setNewItem(prev => ({
          ...prev, category: data.category, icon: data.icon || "📦", location: data.location || "Alacena", expires: expirationDate.toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      alert("Hubo un error con la IA.");
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveItem = async () => {
    if (!newItem.name || !newItem.quantity || !newItem.expires) return alert("⚠️ Llena nombre, cantidad y caducidad.");
    const numericQuantity = parseFloat(newItem.quantity);
    if (isNaN(numericQuantity)) return alert("⚠️ La cantidad debe ser un número.");

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      await supabase.from('pantry_items').insert({
        user_id: user.id,
        ingredient_name: newItem.name,
        quantity: numericQuantity,
        unit: newItem.unit,
        category: newItem.category,
        expiration_date: newItem.expires,
        icon: newItem.icon,
        location: newItem.location,
        status: "good" // El status ya se calcula dinámicamente en el frontend
      });

      setShowAddModal(false);
      setNewItem({ name: "", quantity: "", unit: "pzas", expires: "", category: "Vegetales", location: "Refrigerador", icon: "🛒" });
      fetchPantryItems();
    } catch (err) {
      alert("Hubo un error al guardar.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = pantryItems.filter((item) => {
    const matchCategory = activeCategory === "Todo" || item.category === activeCategory;
    const matchSearch = item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Calculamos alertas globales
  const expiringCount = pantryItems.filter((item) => {
    const diffDays = Math.ceil((new Date(item.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  return (
    <div className="relative pb-24">
      {/* Encabezado con el nuevo Componente de Campana */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#335C67]">Mi Alacena Digital</h1>
          <p className="text-[#5a8a96] mt-1">{pantryItems.length} ingredientes registrados</p>
        </div>
        <NotificationBell items={pantryItems} />
      </header>

      {/* Alerta de Banner */}
      {expiringCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-2xl mb-8 bg-[#9E2A2B]/10 border border-[#9E2A2B]/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} color="#9E2A2B" />
            <span className="text-[#9E2A2B] font-semibold text-sm sm:text-base">¡Tienes {expiringCount} artículos que necesitan atención pronto!</span>
          </div>
          <Link href="/dashboard/recipes" className="sm:ml-auto px-5 py-2 rounded-full bg-[#9E2A2B] text-white text-sm font-bold hover:bg-[#7d2122] transition-colors">Usar Ahora</Link>
        </div>
      )}

      {/* Controles */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#335C67]/20 shadow-sm focus-within:border-[#E09F3E] transition-all">
          <Search size={20} color="#5a8a96" />
          <input type="text" placeholder="Buscar ingredientes..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="flex-1 outline-none font-medium text-black placeholder:text-gray-500 placeholder:font-normal" />
        </div>
        <Link href="/dashboard/recipes" className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#335C67] text-[#FFF3B0] font-bold shadow-md hover:bg-[#234149] transition-colors"><BookOpen size={20} /> Generar Recetas</Link>
      </div>

      {/* Categorías */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${cat === activeCategory ? 'bg-[#9E2A2B] text-white shadow-md' : 'bg-white text-[#335C67] border border-[#335C67]/20 hover:bg-[#335C67]/5'}`}>{cat}</button>
        ))}
      </div>

      {/* Grid refactorizado utilizando el nuevo componente PantryItemCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#5a8a96] font-medium text-lg">No hay ingredientes registrados.</div>
        ) : (
          filtered.map((item) => <PantryItemCard key={item.id} item={item} />)
        )}
      </div>

      {/* Botón y Modal */}
      <button onClick={() => setShowAddModal(true)} className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center bg-[#E09F3E] text-white shadow-lg hover:scale-105 transition-all z-40"><Plus size={32} /></button>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm" onMouseDown={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="bg-[#FFFAE6] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#335C67]">Agregar Ingrediente</h3>
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

              <button type="button" onClick={handleSaveItem} disabled={isSaving} className="w-full py-4 mt-4 bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold rounded-xl flex justify-center gap-2">
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : "Guardar en Alacena"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}