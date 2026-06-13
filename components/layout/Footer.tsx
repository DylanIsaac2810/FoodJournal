import { ChefHat } from "lucide-react";

export function Footer() {
  return (
    <footer className="py-10 px-8" style={{ backgroundColor: "#335C67" }}>
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ChefHat size={22} color="#FFF3B0" />
          <span
            style={{ fontFamily: "'Playfair Display', serif", color: "#FFF3B0", fontWeight: 700, fontSize: 18 }}
          >
            Food Journal
          </span>
        </div>
        <p style={{ color: "rgba(255,243,176,0.5)", fontSize: 14 }}>
          © 2026 Food Journal. Hecho con ♥ para el planeta.
        </p>
      </div>
    </footer>
  );
}