'use client';

import Link from "next/link";
import { ChefHat } from "lucide-react";

// Agregamos la propiedad para recibir la función
interface NavbarProps {
  onLoginClick: () => void;
}

export function Navbar({ onLoginClick }: NavbarProps) {
  const navItems = [
    { label: "Características", href: "/#caracteristicas" },
    { label: "Cómo Funciona", href: "/#como-funciona" },
    { label: "Misión", href: "/#mision" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4"
      style={{ backgroundColor: "#335C67" }}
    >
      <div className="flex items-center gap-2">
        <img 
          src="/img/logo.png" 
          alt="Logo Food Journal" 
          className="h-14 w-auto drop-shadow-sm"
        />
        <span
          className="text-xl"
          style={{ fontFamily: "'Playfair Display', serif", color: "#FFF3B0", fontWeight: 700 }}
        >
          Food Journal
        </span>
      </div>
      
      <div className="hidden text-xl lg:text-2xl font-bold md:flex items-center gap-20">
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className="transition-colors"
            style={{ color: "#FFF3B0", opacity: 0.85 }}
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.85")}
          >
            {item.label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {/* Cambiamos el <Link> por un <button> que llama a onLoginClick */}
        <button
          onClick={onLoginClick}
          className="px-5 py-2 rounded-full transition-all inline-block"
          style={{ backgroundColor: "#9E2A2B", color: "#fff", fontWeight: 600 }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#7d2122")}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = "#9E2A2B")}
        >
          Comenzar
        </button>
      </div>
    </nav>
  );
}