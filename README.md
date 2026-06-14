# 🍳 Food Journey - Alacena y Recetario Inteligente

Food Journey es una plataforma web innovadora diseñada para optimizar la gestión alimentaria en el hogar. Nuestra misión es reducir el desperdicio de comida, evitar compras innecesarias y transformar los ingredientes disponibles en recomendaciones gastronómicas dinámicas y sostenibles mediante Inteligencia Artificial.

## 🚀 Tecnologías Principales

Este proyecto está construido con un stack moderno y escalable:

- **Framework:** [Next.js 14+](https://nextjs.org/) (App Router)
- **Frontend:** React, Tailwind CSS, Lucide React (Iconos)
- **Backend (BaaS):** [Supabase](https://supabase.com/) (Autenticación OAuth/Email y Base de Datos PostgreSQL)
- **Inteligencia Artificial:** [Google Gemini API](https://aistudio.google.com/) (Clasificación automática de alimentos)
- **Despliegue sugerido:** Vercel

---

## 📂 Estructura del Proyecto

El proyecto sigue la estructura recomendada del App Router de Next.js, separando claramente la UI, la lógica de servidor y los clientes de base de datos.

```text
food-journal/
├── app/                        # Rutas de la aplicación (Next.js App Router)
│   ├── api/classify/route.ts   # Endpoint de Backend para IA (Gemini)
│   │   ├── cassify             # Clasificador inteligente de ingredientes
│   │   └── generate-recipes    # Generador inteligente de recetas
│   |
│   ├── auth/callback/route.ts  # Manejador del login con Supabase
│   ├── dashboard/              # Vistas protegidas del usuario
│   │   ├── layout.tsx          # Menú lateral (Sidebar) retráctil
│   │   ├── recipes.tsx         # Vista del recetario inteligente
│   │   ├── cook.tsx            # Vista recetas para cocinar
│   │   └── pantry/page.tsx     # Vista principal de la Alacena Digital
|   ├──components/              # Componentes UI reutilizables
│   │     ├── auth/             # Modales de Login/Registro y formulario de preferencias
│   │     ├── layout/           # Navbar y Footer públicos
│   │     ├── cook/             # Modales de cook
│   │     ├── recipes/          # Modales de recipes
│   │     ├── ui/               # Elementos UI reciclables
│   │     └── pantry/           # Tarjetas de ingredientes y Notificaciones
|   |
│   └── page.tsx                # Landing Page pública
├── utils/
│   └── supabase/               # Configuración de Supabase
│       ├── middleware.ts       # Protege rutas de la aplicacion
│       ├── client.ts           # Cliente para componentes de React
│       └── server.ts           # Cliente para Server Components/APIs
├── public/                     # Imágenes, iconos estáticos
├── .env.local                  # Variables de entorno (¡NO SUBIR A GITHUB!)
└── package.json                # Dependencias del proyecto

## Clonar repositorio
git clone [https://github.com/DylanIsaac2810/FoodJournal.git](https://github.com/DylanIsaac2810/FoodJournal.git)
cd food-journal

##Instalar dependencias
npm install
-- Si surgen errores ejecutar:
npm install @supabase/supabase-js @supabase/ssr @google/generative-ai lucide-react

##Levantar servidor
npm run dev