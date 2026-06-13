import { useState, useRef, useEffect } from "react";
import { Bell, AlertCircle, Clock } from "lucide-react";

export function NotificationBell({ items }: { items: any[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer clic afuera
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calcular alertas dinámicamente
  const alerts = items.filter((item) => {
    const expDate = new Date(item.expiration_date);
    const today = new Date();
    const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3; // Mostrar si caduca en 3 días o menos (o si ya caducó)
  }).sort((a, b) => new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime());

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-[#335C67]/10 hover:bg-[#335C67]/20 transition-colors"
      >
        <Bell size={24} color="#335C67" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center bg-[#9E2A2B] text-white text-xs font-bold shadow-sm">
            {alerts.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-4 border-b border-gray-100 bg-[#FFFAE6]">
            <h3 className="font-bold text-[#335C67]">Notificaciones de Alacena</h3>
          </div>
          <div className="max-h-80 overflow-y-auto">
            {alerts.length === 0 ? (
              <div className="p-6 text-center text-sm text-[#5a8a96]">
                Todo está fresco. ¡No hay alertas! 🎉
              </div>
            ) : (
              alerts.map((item) => {
                const expDate = new Date(item.expiration_date);
                const isExpired = expDate < new Date();
                
                return (
                  <div key={item.id} className="p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors flex gap-3 items-start">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <h4 className={`font-bold text-sm ${isExpired ? 'text-[#9E2A2B]' : 'text-[#b87d2a]'}`}>
                        {item.ingredient_name}
                      </h4>
                      <div className="flex items-center gap-1 mt-1 text-xs text-[#5a8a96]">
                        {isExpired ? <AlertCircle size={12} color="#9E2A2B" /> : <Clock size={12} />}
                        <span>
                          {isExpired ? "Caducó o caduca hoy" : "Caduca en los próximos días"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}