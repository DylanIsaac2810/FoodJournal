'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Plus, BookOpen, Bell, AlertTriangle, Package, X, Loader2, Sparkles } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

const categories = ["Todo", "Vegetales", "Frutas", "Lácteos", "Granos", "Proteínas", "Condimentos"];
const locations = ["Refrigerador", "Alacena", "Congelador"];
const units = ["g", "kg", "ml", "L", "pzas", "manojo", "paquete"]; // Opciones de unidades

const statusConfig = {
  good: { label: "Fresco", bg: "rgba(51,92,103,0.12)", color: "#335C67" },
  warning: { label: "Por Caducar", bg: "rgba(224,159,62,0.18)", color: "#b87d2a" },
  critical: { label: "¡Caduca Hoy!", bg: "rgba(158,42,43,0.15)", color: "#9E2A2B" },
};

export default function PantryDashboard() {
  const [activeCategory, setActiveCategory] = useState("Todo");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [isClassifying, setIsClassifying] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [pantryItems, setPantryItems] = useState<any[]>([]); 

  const supabase = createClient();

  // Estado del formulario actualizado (quantity y unit separados)
  const [newItem, setNewItem] = useState({ 
    name: "", 
    quantity: "", 
    unit: "pzas",
    expires: "", 
    category: "Vegetales", 
    location: "Refrigerador",
    icon: "🛒" 
  });

  const fetchPantryItems = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('pantry_items')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) console.error("Error cargando alacena:", error);
    else setPantryItems(data || []);
  };

  useEffect(() => {
    fetchPantryItems();
  }, []);

  const handleAutoClassify = async () => {
    if (!newItem.name.trim()) return;
    
    setIsClassifying(true);
    try {
      const response = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredient: newItem.name }),
      });
      
      const data = await response.json();
      
      if (data && data.category) {
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + (data.daysToExpire || 7));
        const formattedDate = expirationDate.toISOString().split('T')[0]; 

        setNewItem(prev => ({
          ...prev,
          category: data.category,
          icon: data.icon || "📦",
          location: data.location || "Alacena",
          expires: formattedDate
        }));
      }
    } catch (error) {
      console.error("Error contactando a Gemini:", error);
    } finally {
      setIsClassifying(false);
    }
  };

  const handleSaveItem = async () => {
    // Validamos que la cantidad sea un número válido
    if (!newItem.name || !newItem.quantity || !newItem.expires) {
      alert("Por favor llena nombre, cantidad y fecha.");
      return;
    }

    const numericQuantity = parseFloat(newItem.quantity);
    if (isNaN(numericQuantity)) {
      alert("La cantidad debe ser un número válido.");
      return;
    }

    setIsSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No hay usuario autenticado");

      const expDate = new Date(newItem.expires);
      const today = new Date();
      const diffTime = Math.abs(expDate.getTime() - today.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let currentStatus = "good";
      if (expDate < today) currentStatus = "critical";
      else if (diffDays <= 3) currentStatus = "warning";

      // Guardamos la cantidad como número y la unidad como texto
      const { error } = await supabase.from('pantry_items').insert({
        user_id: user.id,
        ingredient_name: newItem.name,
        quantity: numericQuantity,
        unit: newItem.unit,
        category: newItem.category,
        expiration_date: newItem.expires,
        icon: newItem.icon,
        location: newItem.location,
        status: currentStatus
      });

      if (error) throw error;

      setShowAddModal(false);
      setNewItem({ name: "", quantity: "", unit: "pzas", expires: "", category: "Vegetales", location: "Refrigerador", icon: "🛒" });
      fetchPantryItems();

    } catch (err: any) {
      console.error("Error guardando:", err.message);
      alert("Hubo un error al guardar el ingrediente.");
    } finally {
      setIsSaving(false);
    }
  };

  const filtered = pantryItems.filter((item) => {
    const matchCategory = activeCategory === "Todo" || item.category === activeCategory;
    const matchSearch = item.ingredient_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  const expiringCount = pantryItems.filter((i) => i.status === "critical" || i.status === "warning").length;

  return (
    <div className="relative pb-24">
      {/* Encabezado */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 style={{ fontFamily: "'Playfair Display', serif" }} className="text-3xl font-bold text-[#335C67]">
            Mi Alacena Digital
          </h1>
          <p className="text-[#5a8a96] mt-1">{pantryItems.length} ingredientes registrados</p>
        </div>
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-xl bg-[#335C67]/10 hover:bg-[#335C67]/20 transition-colors">
            <Bell size={24} color="#335C67" />
            {expiringCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-[#9E2A2B] text-white text-xs font-bold shadow-sm">
                {expiringCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Alerta de Caducidad */}
      {expiringCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 rounded-2xl mb-8 bg-[#9E2A2B]/10 border border-[#9E2A2B]/20">
          <div className="flex items-center gap-3">
            <AlertTriangle size={24} color="#9E2A2B" />
            <span className="text-[#9E2A2B] font-semibold text-sm sm:text-base">
              ¡Tienes {expiringCount} artículos que necesitan atención pronto!
            </span>
          </div>
          <Link href="/dashboard/recipes" className="sm:ml-auto px-5 py-2 rounded-full bg-[#9E2A2B] text-white text-sm font-bold hover:bg-[#7d2122] transition-colors text-center">
            Usar Ahora
          </Link>
        </div>
      )}

      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col lg:flex-row gap-4 mb-8">
        <div className="flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-white border border-[#335C67]/20 shadow-sm focus-within:border-[#E09F3E] focus-within:ring-2 focus-within:ring-[#E09F3E]/20 transition-all">
          <Search size={20} color="#5a8a96" />
          <input
            type="text"
            placeholder="Buscar ingredientes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none font-medium text-black placeholder:text-gray-500 placeholder:font-normal"
          />
        </div>
        <Link href="/dashboard/recipes" className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-[#335C67] text-[#FFF3B0] font-bold hover:bg-[#234149] transition-colors shadow-md">
          <BookOpen size={20} /> Generar Recetas
        </Link>
      </div>

      {/* Filtros por Categoría */}
      <div className="flex flex-wrap gap-2 mb-8">
        {categories.map((cat) => {
          const active = cat === activeCategory;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                active ? 'bg-[#9E2A2B] text-white shadow-md' : 'bg-white text-[#335C67] border border-[#335C67]/20 hover:bg-[#335C67]/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Grid de Ingredientes de Supabase */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-[#5a8a96] font-medium text-lg">
            No hay ingredientes registrados. ¡Haz clic en el botón + para agregar uno!
          </div>
        ) : (
          filtered.map((item) => {
            const s = statusConfig[item.status as keyof typeof statusConfig] || statusConfig.good;
            return (
              <div key={item.id} className="p-5 rounded-3xl bg-white border border-[#335C67]/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{item.icon}</div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
                    {s.label}
                  </span>
                </div>
                <h3 className="font-bold text-[#335C67] text-lg mb-1">{item.ingredient_name}</h3>
                <p className="font-mono text-[#E09F3E] font-semibold">{item.quantity} {item.unit}</p>
                
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-[#5a8a96] font-medium">
                    <Package size={14} /> {item.location}
                  </div>
                  <div className="text-xs text-[#5a8a96] font-medium bg-gray-50 px-2 py-1 rounded-md">
                    Vence: {new Date(item.expiration_date).toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Botón Flotante para Agregar */}
      <button
        onClick={() => setShowAddModal(true)}
        className="fixed bottom-8 right-8 w-16 h-16 rounded-full flex items-center justify-center bg-[#E09F3E] text-white shadow-lg hover:scale-105 hover:bg-[#c98a30] transition-all z-40"
      >
        <Plus size={32} />
      </button>

      {/* Modal para agregar ingrediente */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#335C67]/60 backdrop-blur-sm" onClick={(e) => e.target === e.currentTarget && setShowAddModal(false)}>
          <div className="bg-[#FFFAE6] rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-serif text-2xl font-bold text-[#335C67]">Agregar Ingrediente</h3>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                <X size={24} color="#5a8a96" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#335C67] mb-2">Nombre del alimento</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-4 top-3 text-xl">{newItem.icon}</span>
                    <input 
                      type="text" 
                      placeholder="Ej. Manzana verde" 
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium placeholder:text-gray-500 transition-all" 
                    />
                  </div>
                  <button 
                    onClick={handleAutoClassify}
                    disabled={isClassifying || !newItem.name}
                    title="Auto-completar con IA"
                    className="px-4 py-3 rounded-xl bg-[#335C67] text-[#FFF3B0] font-bold hover:bg-[#234149] disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {isClassifying ? <Loader2 size={20} className="animate-spin" /> : <Sparkles size={20} />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Inputs de cantidad y unidad SEPARADOS */}
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="block text-sm font-bold text-[#335C67] mb-2">Cantidad</label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      placeholder="Ej. 2" 
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium placeholder:text-gray-500" 
                    />
                  </div>
                  <div className="w-24">
                    <label className="block text-sm font-bold text-[#335C67] mb-2">Unidad</label>
                    <select 
                      value={newItem.unit}
                      onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                      className="w-full px-2 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium"
                    >
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Caducidad</label>
                  <input 
                    type="date" 
                    value={newItem.expires}
                    onChange={(e) => setNewItem({ ...newItem, expires: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium" 
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Categoría</label>
                  <select 
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium"
                  >
                    {categories.filter(c => c !== "Todo").map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#335C67] mb-2">Ubicación</label>
                  <select 
                    value={newItem.location}
                    onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-[#335C67]/20 focus:ring-2 focus:ring-[#E09F3E] outline-none text-black font-medium"
                  >
                    {locations.map(loc => <option key={loc} value={loc}>{loc}</option>)}
                  </select>
                </div>
              </div>

              <button 
                onClick={handleSaveItem}
                disabled={isSaving}
                className="w-full py-4 mt-4 bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold rounded-xl transition-colors shadow-md text-lg flex justify-center items-center gap-2"
              >
                {isSaving ? <Loader2 size={24} className="animate-spin" /> : "Guardar en Alacena"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}