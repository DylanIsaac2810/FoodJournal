'use client';

import { useState } from "react";
import { Leaf, Clock, Sparkles, ArrowRight, Recycle, Heart } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { StepCard } from "@/components/ui/StepCard";
import { LoginModal } from "@/components/auth/LoginModal";

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  const steps = [
    {
      icon: <Leaf size={28} />,
      number: "01",
      title: "Agrega tus Ingredientes",
      desc: "Escanea códigos de barras o ingresa manualmente lo que hay en tu refrigerador y alacena. Rastrearemos cantidades y fechas de caducidad automáticamente.",
    },
    {
      icon: <Sparkles size={28} />,
      number: "02",
      title: "Obtén Recetas Inteligentes",
      desc: "Nuestra IA genera recetas personalizadas con lo que ya tienes, reduciendo el desperdicio de comida y ahorrando dinero en el supermercado.",
    },
    {
      icon: <Clock size={28} />,
      number: "03",
      title: "Cocina con Guía",
      desc: "Sigue instrucciones paso a paso con un temporizador de cocina integrado, información nutricional y sugerencias de sustitución.",
    },
  ];

  const stats = [
    { value: "40%", label: "Menos Desperdicio" },
    { value: "12K+", label: "Recetas Generadas" },
    { value: "8K+", label: "Cocineros Felices" },
    { value: "3.2M", label: "Comidas Preparadas" },
  ];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Nunito', sans-serif" }}>
      
      {/* Componente Navbar con la función para abrir el modal */}
      <Navbar onLoginClick={() => setShowLogin(true)} />

      {/* Sección Hero */}
      <section
        id="caracteristicas"
        className="relative pt-32 pb-24 px-6 overflow-hidden scroll-mt-20"
        style={{ backgroundColor: "#FFF3B0", minHeight: "100vh", display: "flex", alignItems: "center" }}
      >
        {/* Elementos decorativos (Blobs) */}
        <div
          className="absolute top-20 right-10 rounded-full opacity-30 pointer-events-none"
          style={{ width: 340, height: 340, backgroundColor: "#E09F3E", filter: "blur(80px)" }}
        />
        <div
          className="absolute bottom-10 left-0 rounded-full opacity-20 pointer-events-none"
          style={{ width: 260, height: 260, backgroundColor: "#9E2A2B", filter: "blur(90px)" }}
        />

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center w-full">
          {/* Izquierda */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: "rgba(158,42,43,0.1)", color: "#9E2A2B" }}
            >
              <Leaf size={14} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                COCINA SOSTENIBLE
              </span>
            </div>
            <h1
              className="mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 800,
                color: "#335C67",
                lineHeight: 1.15,
              }}
            >
              Tu Cocina,{" "}
              <span style={{ color: "#9E2A2B" }}>Reimaginada</span>{" "}
              para Menor Desperdicio
            </h1>
            <p className="mb-8 text-lg" style={{ color: "#5a8a96", maxWidth: 480, lineHeight: 1.7 }}>
              Controla lo que hay en tu alacena, descubre recetas con lo que ya tienes y cocina con confianza — todo mientras reduces el desperdicio de alimentos y ahorras dinero.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all shadow-lg"
                style={{ backgroundColor: "#9E2A2B", color: "#fff", fontWeight: 700, fontSize: 16 }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#7d2122";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#9E2A2B";
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                }}
              >
                Inicia tu Alacena <ArrowRight size={18} />
              </button>
              <button
                onClick={() => setShowLogin(true)}
                className="flex items-center justify-center gap-2 px-8 py-4 rounded-full transition-all"
                style={{
                  backgroundColor: "transparent",
                  color: "#335C67",
                  fontWeight: 700,
                  fontSize: 16,
                  border: "2px solid #335C67",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "#335C67";
                  (e.currentTarget as HTMLElement).style.color = "#FFF3B0";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "#335C67";
                }}
              >
                Explorar Recetas
              </button>
            </div>

            {/* Fila de Estadísticas */}
            <div className="mt-12 grid grid-cols-4 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <div
                    style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 24,
                      fontWeight: 800,
                      color: "#9E2A2B",
                    }}
                  >
                    {s.value}
                  </div>
                  <div style={{ fontSize: 12, color: "#5a8a96", fontWeight: 600 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Derecha — Collage de imágenes intacto */}
          <div className="relative hidden md:block">
            <div className="relative" style={{ height: 520 }}>
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=520&h=400&fit=crop&auto=format"
                alt="Preparación de comida saludable y colorida"
                className="rounded-3xl shadow-2xl object-cover"
                style={{ width: 380, height: 400, position: "absolute", top: 0, right: 0 }}
              />
              <div
                className="rounded-2xl shadow-xl p-4 flex items-center gap-3"
                style={{
                  backgroundColor: "#FFFAE6",
                  position: "absolute",
                  bottom: 60,
                  left: 0,
                  width: 220,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "#9E2A2B" }}
                >
                  <Sparkles size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: "#5a8a96", fontWeight: 600 }}>Generado por IA</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#335C67" }}>
                    Pasta Primavera
                  </div>
                </div>
              </div>
              <div
                className="rounded-2xl shadow-xl p-4"
                style={{
                  backgroundColor: "#335C67",
                  position: "absolute",
                  top: 30,
                  left: -10,
                  width: 160,
                }}
              >
                <div style={{ fontSize: 12, color: "#FFF3B0", opacity: 0.7, fontWeight: 600 }}>
                  Puntuación Alacena
                </div>
                <div
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 32,
                    fontWeight: 800,
                    color: "#E09F3E",
                  }}
                >
                  87%
                </div>
                <div style={{ fontSize: 11, color: "#FFF3B0", opacity: 0.6 }}>Artículos frescos</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Cómo Funciona */}
      <section id="como-funciona" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: "#335C67" }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-4"
              style={{ backgroundColor: "rgba(255,243,176,0.12)", color: "#E09F3E" }}
            >
              <Sparkles size={14} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                CÓMO FUNCIONA
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem,4vw,2.8rem)",
                fontWeight: 800,
                color: "#FFF3B0",
                lineHeight: 1.2,
              }}
            >
              Tres Pasos para Cocinar sin Desperdicios
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <StepCard 
                key={step.number}
                number={step.number}
                icon={step.icon}
                title={step.title}
                desc={step.desc}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Sección Misión / Visión */}
      <section id="mision" className="py-24 px-6 scroll-mt-20" style={{ backgroundColor: "#FFF3B0" }}>
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <img
              src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=560&h=480&fit=crop&auto=format"
              alt="Vegetales frescos y cocina sostenible"
              className="rounded-3xl shadow-xl object-cover w-full"
              style={{ height: 440 }}
            />
            <div
              className="absolute -bottom-6 -right-6 rounded-3xl p-6 shadow-xl"
              style={{ backgroundColor: "#9E2A2B", width: 220 }}
            >
              <Recycle size={28} color="#FFF3B0" className="mb-2" />
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 22,
                  fontWeight: 800,
                  color: "#FFF3B0",
                }}
              >
                1.300M tons
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,243,176,0.75)" }}>
                de comida desperdiciada globalmente al año
              </div>
            </div>
          </div>
          <div>
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
              style={{ backgroundColor: "rgba(158,42,43,0.1)", color: "#9E2A2B" }}
            >
              <Heart size={14} />
              <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.06em" }}>
                NUESTRA MISIÓN
              </span>
            </div>
            <h2
              className="mb-6"
              style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(1.8rem,3.5vw,2.6rem)",
                fontWeight: 800,
                color: "#335C67",
                lineHeight: 1.2,
              }}
            >
              Cocinar Nunca Debería Costarle a la Tierra
            </h2>
            <p className="mb-6" style={{ color: "#5a8a96", lineHeight: 1.8, fontSize: 16 }}>
              Creemos que la alimentación sostenible comienza en casa. Food Journal fue construido para cerrar la brecha entre lo que ya está en tu cocina y las comidas que amas, haciendo que cada ingrediente cuente.
            </p>
            <p style={{ color: "#5a8a96", lineHeight: 1.8, fontSize: 16 }}>
              Nuestra visión es un mundo donde cada hogar desperdicie menos, coma mejor y se conecte más profundamente con los ingredientes que los nutren — guiados por tecnología inteligente y amor por la comida.
            </p>
            <div className="mt-10 flex flex-col gap-4">
              {[
                "Reduce el desperdicio de alimentos en el hogar hasta un 40%",
                "Nutrición personalizada con lo que ya tienes",
                "Seguimiento de la huella de carbono para cada receta",
              ].map((item) => (
                <div key={item} className="flex items-center gap-3">
                  <div
                    className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: "#E09F3E" }}
                  >
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: "#fff" }} />
                  </div>
                  <span style={{ color: "#335C67", fontWeight: 600 }}>{item}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowLogin(true)}
              className="mt-10 inline-flex items-center gap-2 px-8 py-4 rounded-full transition-all shadow-md"
              style={{ backgroundColor: "#9E2A2B", color: "#fff", fontWeight: 700, fontSize: 16 }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#7d2122";
                (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.backgroundColor = "#9E2A2B";
                (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
              }}
            >
              Comienza tu Viaje <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </section>

      {/* Componente Footer */}
      <Footer />

      {/* Renderizado condicional del Modal Flotante */}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      
    </div>
  );
}