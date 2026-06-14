'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ChefHat, 
  Utensils, 
  Flame, 
  User, 
  LogOut, 
  Menu,
  X,
  ShoppingBasket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState(false);
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const navItems = [
    { label: 'Mi Alacena', href: '/dashboard/pantry', icon: <ShoppingBasket size={22} /> },
    { label: 'Generar Recetas', href: '/dashboard/recipes', icon: <Utensils size={22} /> },
    { label: 'Cocinar', href: '/dashboard/cook', icon: <Flame size={22} /> },
    { label: 'Mi Perfil', href: '/dashboard/profile', icon: <User size={22} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" style={{ fontFamily: "'Nunito', sans-serif" }}>
      
      {/* Botón de Menú para Móviles */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-[#335C67] flex items-center justify-between px-4 z-50 shadow-md">
        <div className="flex items-center gap-3">
          <img 
            src="/img/logo.png" 
            alt="Food Journey Logo" 
            className="h-10 w-10 object-contain shrink-0 drop-shadow-sm" 
          />
          <span className="text-[#FFF3B0] font-bold text-xl tracking-wide" style={{ fontFamily: "'Playfair Display', serif" }}>
            Food Journal
          </span>
        </div>
        <button 
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="text-[#FFF3B0] focus:outline-none hover:scale-105 transition-transform"
        >
          {isMobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Barra de Navegación Lateral (Sidebar) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 transform transition-all duration-300 ease-in-out bg-[#335C67] flex flex-col shadow-2xl md:relative md:translate-x-0
          ${isMobileOpen ? 'translate-x-0 w-72' : '-translate-x-full'}
          ${isDesktopCollapsed ? 'md:w-20' : 'md:w-72'}
        `}
      >
        {/* Cabecera del Sidebar */}
        <div className="h-24 flex items-center px-4 border-b border-white/10 mt-16 md:mt-0 relative">
          <div className={`flex items-center gap-3 overflow-hidden ${isDesktopCollapsed ? 'justify-center w-full px-0' : 'w-full'}`}>
            <img 
              src="/img/logo.png" 
              alt="Logo Food Journey" 
              className={`object-contain shrink-0 drop-shadow-sm transition-all duration-300 ${isDesktopCollapsed ? 'h-10 w-10' : 'h-12 w-12'}`}
            />
            {!isDesktopCollapsed && (
              <span 
                className="text-xl lg:text-2xl font-bold text-[#FFF3B0] whitespace-nowrap tracking-wide"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Food Journal
              </span>
            )}
          </div>

          {/* Botón Flotante para colapsar en escritorio */}
          <button
            onClick={() => setIsDesktopCollapsed(!isDesktopCollapsed)}
            className="hidden md:flex items-center justify-center w-7 h-7 rounded-full text-[#FFF3B0] hover:text-white transition-colors absolute -right-3.5 top-8 bg-[#9E2A2B] border-2 border-[#FFFAE6] shadow-md z-50"
          >
            {isDesktopCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-3 py-8 space-y-2 overflow-y-auto overflow-x-hidden">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.label}
                href={item.href}
                onClick={() => setIsMobileOpen(false)} 
                title={isDesktopCollapsed ? item.label : ''} 
                className={`flex items-center gap-4 py-3 rounded-xl transition-all font-semibold ${
                  isDesktopCollapsed ? 'justify-center px-0' : 'px-4'
                } ${
                  isActive 
                    ? 'bg-[#9E2A2B] text-white shadow-md' 
                    : 'text-[#FFF3B0] opacity-80 hover:bg-white/10 hover:opacity-100'
                }`}
              >
                <div className="flex-shrink-0">{item.icon}</div>
                {!isDesktopCollapsed && (
                  <span className="whitespace-nowrap truncate">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer del Sidebar (Cerrar Sesión) */}
        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            title={isDesktopCollapsed ? "Cerrar Sesión" : ""}
            className={`flex items-center gap-4 py-3 w-full rounded-xl transition-all font-semibold text-[#FFF3B0] opacity-80 hover:bg-white/10 hover:text-[#E09F3E] hover:opacity-100 ${
              isDesktopCollapsed ? 'justify-center px-0' : 'px-4'
            }`}
          >
            <div className="flex-shrink-0"><LogOut size={22} /></div>
            {!isDesktopCollapsed && (
              <span className="whitespace-nowrap">Cerrar Sesión</span>
            )}
          </button>
        </div>
      </aside>

      {/* Fondo oscuro para móviles cuando el menú está abierto */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Área Principal de Contenido */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 bg-[#FFFAE6]">
        <div className="p-6 md:p-10 max-w-7xl mx-auto min-h-full transition-all duration-300">
          {children}
        </div>
      </main>

    </div>
  );
}