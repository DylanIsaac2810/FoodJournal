'use client';

import { useState, useEffect } from "react";
import { User, Lock, Mail, ChefHat, Heart, ShieldCheck, Loader2, AlertCircle, AlertTriangle, CheckCircle2, Sparkles } from "lucide-react";
import { createClient } from '@/utils/supabase/client';

const DIET_OPTIONS = ["Balanceado", "Vegetariano", "Vegano", "Keto", "Sin Gluten", "Sin Lácteos", "Pescatariano"];
const ALLERGY_OPTIONS = ["Ninguna", "Nueces", "Mariscos", "Huevo", "Lácteos", "Soya", "Gluten", "Pescado"];
const TOOL_OPTIONS = ["Horno", "Microondas", "Licuadora", "Sartén", "Olla de presión", "Air Fryer", "Batidora", "Procesador de alimentos"];

export default function ProfileDashboard() {
  const supabase = createClient();
  const [isLoading, setIsLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState(""); 
  const [dietaryPreferences, setDietaryPreferences] = useState<string[]>([]);
  const [allergies, setAllergies] = useState<string[]>([]);
  const [cookingTools, setCookingTools] = useState<string[]>([]);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);

  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'warning'}>({ show: false, message: "", type: "success" });

  const showToast = (message: string, type: 'success' | 'error' | 'warning' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast(prev => ({ ...prev, show: false })), 3500);
  };

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setEmail(user.email || "");

      const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      
      if (profile) {
        setFullName(profile.display_name || "");
        setDietaryPreferences(profile.dietary_preferences || []);
        setAllergies(profile.allergies || []);
        setCookingTools(profile.cooking_tools || []);
      }
    } catch (error) {
      console.error("Error al cargar perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (item: string, list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, exclusiveNone = false) => {
    if (exclusiveNone && item === "Ninguna") {
      setList(["Ninguna"]);
      return;
    }
    
    let newList = [...list];
    if (exclusiveNone && newList.includes("Ninguna")) {
      newList = newList.filter(i => i !== "Ninguna");
    }

    if (newList.includes(item)) {
      setList(newList.filter(i => i !== item));
    } else {
      setList([...newList, item]);
    }
  };

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no encontrado");

      const { error } = await supabase.from('profiles').upsert({
        id: user.id,
        display_name: fullName, 
        dietary_preferences: dietaryPreferences,
        allergies: allergies,
        cooking_tools: cookingTools,
      });

      if (error) {
        console.error("Error de Supabase al guardar:", error.message, error.details);
        throw error;
      }

      showToast("Perfil culinario actualizado con éxito", "success");
    } catch (error: any) {
      console.error("Excepción atrapada:", error);
      showToast("Hubo un error al guardar tu perfil. Revisa la consola.", "error");
    } finally {
      setIsSavingProfile(false);
    }
  };

  // ─── FUNCIÓN DE VALIDACIÓN DE CONTRASEÑA ───
  const validatePassword = (pwd: string): string | null => {
    if (pwd.length < 8 || pwd.length > 64) return "La contraseña debe tener entre 8 y 64 caracteres.";
    if (!/[A-Z]/.test(pwd)) return "La contraseña debe contener al menos una letra mayúscula.";
    if (!/[a-z]/.test(pwd)) return "La contraseña debe contener al menos una letra minúscula.";
    if (!/[0-9]/.test(pwd)) return "La contraseña debe contener al menos un número.";
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) return "La contraseña debe contener al menos un carácter especial.";
    return null;
  };

  const handleUpdatePassword = async () => {
    if (!newPassword || !confirmPassword) {
      return showToast("Por favor, llena ambos campos de contraseña", "warning");
    }
    
    if (newPassword !== confirmPassword) {
      return showToast("Las contraseñas no coinciden", "error");
    }

    // Validamos la contraseña contra nuestros parámetros estrictos
    const pwdError = validatePassword(newPassword);
    if (pwdError) {
      return showToast(pwdError, "warning");
    }

    setIsSavingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      showToast("Contraseña actualizada con éxito", "success");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showToast(error.message || "Error al actualizar contraseña", "error");
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center bg-[#FFFAE6]">
        <Loader2 className="animate-spin text-[#E09F3E] mb-4" size={48} />
        <h2 className="text-xl font-serif font-bold text-[#335C67] animate-pulse">Cargando tu perfil...</h2>
      </div>
    );
  }

  return (
    <div className="relative pb-24 font-sans min-h-screen bg-[#FFFAE6]">
      
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

      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="font-serif text-4xl font-bold text-[#335C67]">Mi Perfil</h1>
          <p className="text-[#5a8a96] mt-2 text-lg">Administra tu cuenta y tus preferencias culinarias.</p>
        </div>

        <button 
          id="tour-profile-save"
          onClick={handleSaveProfile}
          disabled={isSavingProfile}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-[#335C67] hover:bg-[#254950] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 disabled:opacity-50"
        >
          {isSavingProfile ? <Loader2 className="animate-spin" size={20}/> : <><CheckCircle2 size={20} /> Guardar Cambios</>}
        </button>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        
        {/* ── COLUMNA IZQUIERDA: DATOS PERSONALES Y SEGURIDAD ── */}
        <div className="w-full lg:w-[400px] flex flex-col gap-8 shrink-0">
          
          <div className="bg-white rounded-3xl p-8 border border-[#335C67]/10 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-6 -mt-6 opacity-5"><User size={150} color="#335C67"/></div>
            
            <h2 className="font-serif text-2xl font-bold text-[#335C67] mb-6 flex items-center gap-2 relative z-10">
              <User color="#E09F3E" /> Datos Personales
            </h2>

            <div className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-bold text-[#5a8a96] mb-2 ml-1">Correo Electrónico</label>
                <div className="flex items-center gap-3 w-full px-5 py-3.5 rounded-2xl bg-gray-50 border border-gray-100 text-gray-500 font-medium">
                  <Mail size={18} /> {email}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#5a8a96] mb-2 ml-1">Nombre Completo</label>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ej. Chef Gusteau"
                  className="w-full px-5 py-3.5 rounded-2xl border border-[#335C67]/20 text-[#335C67] font-bold outline-none focus:border-[#E09F3E] focus:ring-4 focus:ring-[#E09F3E]/10 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-[#335C67]/10 shadow-sm relative overflow-hidden">
            <h2 className="font-serif text-2xl font-bold text-[#335C67] mb-6 flex items-center gap-2">
              <ShieldCheck color="#E09F3E" /> Seguridad
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-[#5a8a96] mb-2 ml-1">Nueva Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-4 text-[#5a8a96]" />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Escribe tu nueva contraseña"
                    className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-[#335C67]/20 text-[#335C67] font-medium outline-none focus:border-[#E09F3E] focus:ring-4 focus:ring-[#E09F3E]/10 transition-all"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-bold text-[#5a8a96] mb-2 ml-1">Confirmar Contraseña</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-4 text-[#5a8a96]" />
                  <input 
                    type="password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full pl-12 pr-5 py-3.5 rounded-2xl border border-[#335C67]/20 text-[#335C67] font-medium outline-none focus:border-[#E09F3E] focus:ring-4 focus:ring-[#E09F3E]/10 transition-all"
                  />
                </div>
              </div>

              <button 
                onClick={handleUpdatePassword}
                disabled={isSavingPassword || !newPassword}
                className="w-full mt-4 py-4 rounded-2xl bg-[#9E2A2B] hover:bg-[#7d2122] text-white font-bold flex items-center justify-center gap-2 transition-all shadow-md disabled:opacity-50"
              >
                {isSavingPassword ? <Loader2 className="animate-spin" size={20}/> : "Actualizar Contraseña"}
              </button>
              <p className="text-xs text-center text-gray-400 font-medium px-4">Si usaste Google para registrarte, cambiar la contraseña aquí creará una para tu cuenta.</p>
            </div>
          </div>

        </div>

        {/* ── COLUMNA DERECHA: PERFIL CULINARIO (IA) ── */}
        <div className="flex-1 flex flex-col gap-8">
          <div id="tour-profile-ia" className="bg-white rounded-3xl p-8 border border-[#335C67]/10 shadow-sm relative overflow-hidden flex-1">
            <div className="absolute bottom-0 right-0 -mr-10 -mb-10 opacity-5"><ChefHat size={250} color="#335C67"/></div>
            
            <h2 className="font-serif text-3xl font-bold text-[#335C67] mb-2 flex items-center gap-3 relative z-10">
              <Sparkles color="#E09F3E" size={28} /> Mi Perfil Culinario (IA)
            </h2>
            <p className="text-[#5a8a96] mb-10 text-sm font-medium relative z-10">Food Journal utiliza esta información para generar recetas perfectamente adaptadas a ti y a lo que tienes en tu cocina.</p>

            <div className="space-y-10 relative z-10">
              
              {/* Sección Alergias */}
              <div>
                <h3 className="text-lg font-bold text-[#335C67] mb-4 flex items-center gap-2">
                  <AlertTriangle size={18} className="text-[#9E2A2B]" /> Alergias e Intolerancias
                </h3>
                <div className="flex flex-wrap gap-3">
                  {ALLERGY_OPTIONS.map((item) => {
                    const isActive = allergies.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, allergies, setAllergies, true)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-[#9E2A2B] text-white shadow-md shadow-[#9E2A2B]/20 scale-105' 
                            : 'bg-white text-[#5a8a96] border border-gray-200 hover:border-[#9E2A2B]/40 hover:bg-red-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sección Dietas */}
              <div>
                <h3 className="text-lg font-bold text-[#335C67] mb-4 flex items-center gap-2">
                  <Heart size={18} className="text-[#E09F3E]" /> Preferencias Dietéticas
                </h3>
                <div className="flex flex-wrap gap-3">
                  {DIET_OPTIONS.map((item) => {
                    const isActive = dietaryPreferences.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, dietaryPreferences, setDietaryPreferences)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-[#E09F3E] text-white shadow-md shadow-[#E09F3E]/20 scale-105' 
                            : 'bg-white text-[#5a8a96] border border-gray-200 hover:border-[#E09F3E]/40 hover:bg-orange-50'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Sección Herramientas */}
              <div>
                <h3 className="text-lg font-bold text-[#335C67] mb-4 flex items-center gap-2">
                  <ChefHat size={18} className="text-[#335C67]" /> Herramientas de Cocina
                </h3>
                <div className="flex flex-wrap gap-3">
                  {TOOL_OPTIONS.map((item) => {
                    const isActive = cookingTools.includes(item);
                    return (
                      <button
                        key={item}
                        onClick={() => toggleSelection(item, cookingTools, setCookingTools)}
                        className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                          isActive 
                            ? 'bg-[#335C67] text-white shadow-md shadow-[#335C67]/20 scale-105' 
                            : 'bg-white text-[#5a8a96] border border-gray-200 hover:border-[#335C67]/40 hover:bg-[#335C67]/5'
                        }`}
                      >
                        {item}
                      </button>
                    )
                  })}
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>
    </div>
  );
}