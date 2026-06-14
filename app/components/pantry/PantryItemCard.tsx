import { Package, Pencil } from "lucide-react";

const statusConfig = {
  good: { label: "Fresco", bg: "rgba(51,92,103,0.12)", color: "#335C67" },
  warning: { label: "Por Caducar", bg: "rgba(224,159,62,0.18)", color: "#b87d2a" },
  critical: { label: "¡Atención!", bg: "rgba(158,42,43,0.15)", color: "#9E2A2B" },
};

export function PantryItemCard({ item, onEdit }: { item: any, onEdit: (item: any) => void }) {
  const expDate = new Date(item.expiration_date);
  const today = new Date();
  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  let currentStatus: "good" | "warning" | "critical" = "good";
  if (diffDays <= 0) currentStatus = "critical";
  else if (diffDays <= 3) currentStatus = "warning";

  const s = statusConfig[currentStatus];

  return (
    <div className="p-5 rounded-3xl bg-white border border-[#335C67]/10 hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative group">
      
      {/* Botón de Editar oculto que aparece en hover */}
      <button 
        onClick={() => onEdit(item)}
        className="absolute top-4 right-4 p-2 bg-gray-100 hover:bg-gray-200 text-[#335C67] rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
        title="Editar ingrediente"
      >
        <Pencil size={16} />
      </button>

      <div className="flex items-start justify-between mb-4 pr-8">
        <div className="text-5xl">{item.icon}</div>
        <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: s.bg, color: s.color }}>
          {s.label}
        </span>
      </div>
      
      <h3 className="font-bold text-[#335C67] text-lg mb-1 truncate pr-2">{item.ingredient_name}</h3>
      <p className="font-mono text-[#E09F3E] font-semibold">{item.quantity} {item.unit}</p>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-[#5a8a96] font-medium">
          <Package size={14} /> {item.location}
        </div>
        <div className="text-xs text-[#5a8a96] font-medium bg-gray-50 px-2 py-1 rounded-md">
          Vence: {expDate.toLocaleDateString("es-MX", { month: "short", day: "numeric" })}
        </div>
      </div>
    </div>
  );
}