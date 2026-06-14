'use client';

import { useState } from "react";
import Link from "next/link";
import { X, ChevronLeft, ChevronRight, Flame, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { createClient } from '@/utils/supabase/client';
import { InteractiveTimer } from "./InteractiveTimer";

interface GuidedCookingModalProps {
  recipe: any;
  onClose: () => void;
}

const getBaseQty = (qty: number, unit: string) => {
  const u = (unit || '').toLowerCase().trim();
  if (['kg', 'kilo', 'kilos', 'kilogramo', 'kilogramos'].includes(u)) return { qty: qty * 1000, type: 'mass', ratio: 1000 };
  if (['l', 'litro', 'litros'].includes(u)) return { qty: qty * 1000, type: 'vol', ratio: 1000 };
  if (['taza', 'tazas'].includes(u)) return { qty: qty * 250, type: 'vol', ratio: 250 };
  if (['cucharada', 'cucharadas', 'cda', 'cdas'].includes(u)) return { qty: qty * 15, type: 'vol', ratio: 15 };
  if (['cucharadita', 'cucharaditas', 'cdita', 'cditas'].includes(u)) return { qty: qty * 5, type: 'vol', ratio: 5 };
  if (['g', 'gr', 'gramo', 'gramos'].includes(u)) return { qty: qty, type: 'mass', ratio: 1 };
  if (['ml', 'mililitro', 'mililitros'].includes(u)) return { qty: qty, type: 'vol', ratio: 1 };
  return { qty, type: 'unit', ratio: 1 };
};

export function GuidedCookingModal({ recipe, onClose }: GuidedCookingModalProps) {
  const [stepIdx, setStepIdx] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);
  const supabase = createClient();

  const total = recipe?.steps?.length || 0;
  const step = recipe?.steps?.[stepIdx] || {};
  const isLast = stepIdx === total - 1;
  const progressPct = ((stepIdx + 1) / total) * 100;

  const handleFinishCooking = async () => {
    setIsFinishing(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (recipe.ownedIngredients) {
        for (const ing of recipe.ownedIngredients) {
          const { data: pantryItems } = await supabase.from('pantry_items').select('*').eq('user_id', user.id).ilike('ingredient_name', `%${ing.name}%`);

          if (pantryItems && pantryItems.length > 0) {
            const item = pantryItems[0];
            const req = getBaseQty(parseFloat(ing.qty) || 1, ing.unit);
            const inv = getBaseQty(item.quantity, item.unit);
            
            let newQty = item.quantity;
            if (req.type === inv.type || (req.type === 'unit' && inv.type === 'unit')) {
               const newBaseQty = inv.qty - req.qty;
               newQty = newBaseQty / inv.ratio;
            } else {
               newQty = item.quantity - (parseFloat(ing.qty) || 1);
            }

            if (newQty <= 0) {
              await supabase.from('pantry_items').delete().eq('id', item.id);
            } else {
              const finalQty = Math.round(newQty * 100) / 100;
              await supabase.from('pantry_items').update({ quantity: finalQty }).eq('id', item.id);
            }
          }
        }
      }
      setFinished(true);
    } catch (error) {
      console.error(error);
      alert("Hubo un problema descontando los ingredientes.");
    } finally {
      setIsFinishing(false);
    }
  };

  const goNext = () => { if (isLast) { handleFinishCooking(); return; } setStepIdx((i) => i + 1); };
  const goPrev = () => setStepIdx((i) => Math.max(0, i - 1));

  if (finished) {
    return (
      <div className="relative flex flex-col items-center justify-center h-full w-full rounded-3xl px-8 shadow-sm overflow-hidden" style={{ backgroundColor: "#335C67" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(224,159,62,0.18) 0%, transparent 65%)" }} />
        <div className="w-24 h-24 rounded-full flex items-center justify-center mb-8" style={{ backgroundColor: "rgba(224,159,62,0.15)", border: "3px solid rgba(224,159,62,0.3)" }}>
          <CheckCircle2 size={52} color="#E09F3E" strokeWidth={1.5} />
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(2rem,4vw,3rem)", fontWeight: 800, color: "#FFFAE6", textAlign: "center", lineHeight: 1.15, marginBottom: 16 }}>
          ¡Platillo completado!
        </h1>
        <p style={{ color: "rgba(255,250,230,0.6)", fontSize: 16, textAlign: "center", maxWidth: 480, marginBottom: 48 }}>
          Has terminado <strong style={{ color: "#E09F3E" }}>{recipe.name}</strong>. Los ingredientes han sido descontados de tu alacena de manera inteligente.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto z-10">
          <button onClick={onClose} className="px-8 py-4 rounded-2xl transition-all" style={{ backgroundColor: "rgba(255,250,230,0.1)", color: "#FFFAE6", fontWeight: 700, fontSize: 15, border: "1.5px solid rgba(255,250,230,0.2)" }}>
            Volver a recetas
          </button>
          <Link href="/dashboard/pantry" className="flex items-center justify-center gap-2 px-8 py-4 rounded-2xl transition-all" style={{ backgroundColor: "#9E2A2B", color: "#fff", fontWeight: 700, fontSize: 15, boxShadow: "0 6px 24px rgba(158,42,43,0.4)" }}>
            <Sparkles size={18} /> Ver mi Alacena
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full rounded-3xl overflow-hidden shadow-sm border border-[#335C67]/10" style={{ backgroundColor: "#FFFAE6" }}>
      <header className="flex items-center gap-5 px-6 py-4 flex-shrink-0" style={{ backgroundColor: "#fff", borderBottom: "1px solid rgba(51,92,103,0.08)" }}>
        <div className="flex items-center gap-4 flex-shrink-0">
          <img src="/img/mosaicos.png" className="object-cover flex-shrink-0 w-12 h-12 rounded-xl" />
          <div className="hidden sm:block">
            <div style={{ fontSize: 10, fontWeight: 700, color: "#b87d2a", letterSpacing: "0.06em" }}>MODO COCINA</div>
            <div style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: "#335C67", fontSize: 15, maxWidth: 180, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{recipe.name}</div>
          </div>
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center justify-between mb-2">
            <span style={{ fontSize: 12, color: "#5a8a96", fontWeight: 700 }}>Paso <span style={{ color: "#335C67" }}>{stepIdx + 1}</span> de <span style={{ color: "#335C67" }}>{total}</span></span>
            <span style={{ fontSize: 12, color: "#b87d2a", fontWeight: 700 }}>{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full rounded-full overflow-hidden" style={{ height: 8, backgroundColor: "rgba(51,92,103,0.1)" }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: "#9E2A2B", transition: "width 0.5s cubic-bezier(0.4,0,0.2,1)" }} />
          </div>
        </div>
        <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all bg-gray-100 hover:bg-gray-200">
          <X size={18} color="#335C67" />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto flex items-stretch">
        <div className="flex-1 flex flex-col xl:flex-row items-center justify-center w-full px-6 py-8 gap-8">
          <div className="flex-1 flex flex-col justify-center w-full max-w-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex-shrink-0 flex items-center justify-center rounded-full" style={{ width: 64, height: 64, backgroundColor: "#335C67", boxShadow: "0 8px 32px rgba(51,92,103,0.25)" }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 800, color: "#FFFAE6", lineHeight: 1 }}>{stepIdx + 1}</span>
              </div>
              <div className="h-px flex-1" style={{ backgroundColor: "rgba(51,92,103,0.12)" }} />
            </div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: "clamp(1.5rem, 2.5vw, 2.5rem)", fontWeight: 800, color: "#335C67", lineHeight: 1.15, marginBottom: 20 }}>
              {step.title || `Paso ${step.step || stepIdx + 1}`}
            </h2>
            <p style={{ fontSize: "clamp(1rem, 1.5vw, 1.25rem)", color: "#335C67", lineHeight: 1.75, fontWeight: 500, marginBottom: 28 }}>
              {step.instruction}
            </p>
            <div className="flex items-start gap-3 px-5 py-4 rounded-2xl" style={{ backgroundColor: "rgba(184,125,42,0.08)", border: "1.5px solid rgba(184,125,42,0.2)" }}>
              <Flame size={18} color="#b87d2a" className="flex-shrink-0 mt-0.5" />
              <p style={{ fontSize: 14, color: "#7a5a1e", lineHeight: 1.6, fontWeight: 500 }}>
                <strong style={{ fontWeight: 800 }}>Tip del chef: </strong>
                {step.tip || "Lee las instrucciones cuidadosamente y ten tus herramientas listas."}
              </p>
            </div>
          </div>

          <div className="flex-shrink-0 flex flex-col items-center justify-center rounded-3xl px-8 py-8 w-full md:w-auto" style={{ backgroundColor: "#335C67", boxShadow: "0 16px 56px rgba(51,92,103,0.22)" }}>
            <InteractiveTimer defaultMinutes={step.time || 5} />
          </div>
        </div>
      </main>

      <footer className="flex items-center justify-between px-6 py-5 flex-shrink-0" style={{ backgroundColor: "#fff", borderTop: "1px solid rgba(51,92,103,0.08)" }}>
        <button onClick={goPrev} disabled={stepIdx === 0} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all border-2 border-gray-200 text-[#335C67] hover:bg-gray-50 disabled:opacity-30 font-bold text-base min-w-[140px] justify-center">
          <ChevronLeft size={20} /> Anterior
        </button>
        {isLast ? (
          <button onClick={goNext} disabled={isFinishing} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all bg-[#9E2A2B] text-white font-bold text-base shadow-lg hover:bg-[#7d2122] min-w-[240px] justify-center">
            {isFinishing ? <Loader2 className="animate-spin" size={20} /> : <Flame size={20} color="#E09F3E" />}
            {isFinishing ? "Descontando..." : "¡Terminar y Descontar!"}
          </button>
        ) : (
          <button onClick={goNext} className="flex items-center gap-2 px-6 py-3.5 rounded-2xl transition-all bg-[#335C67] text-white font-bold text-base shadow-lg hover:bg-[#254950] min-w-[140px] justify-center">
            Siguiente <ChevronRight size={20} />
          </button>
        )}
      </footer>
    </div>
  );
}