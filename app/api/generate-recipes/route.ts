import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { profile, pantry, filters, servings, imageBase64 } = await request.json();

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // AQUI ESTÁ LA CLAVE: Priorizamos ingredientes por caducidad en el texto
    const sortedPantry = [...pantry].sort((a, b) => a.days_to_expire - b.days_to_expire);
    const pantryText = sortedPantry.map((i: any) => 
      `${i.ingredient_name} (${i.quantity} ${i.unit}, caduca en ${i.days_to_expire} días)`
    ).join(', ');

    const profileText = `
      ALERGIAS (EVITAR): ${profile.allergies?.join(', ') || 'Ninguna'}. 
      PREFERENCIAS DIETÉTICAS: ${profile.dietary_preferences?.join(', ') || 'Ninguna'}. 
      HERRAMIENTAS DISPONIBLES: ${profile.cooking_tools?.join(', ') || 'Todas las básicas'}.
    `;

    const prompt = `
      Eres un Chef experto en gestión de despensa inteligente. Crea 1 receta basada en:
      1. ALACENA (Prioriza los que caducan pronto): ${pantryText || "Ninguno"}
      2. PERFIL DEL USUARIO: ${profileText}
      3. FILTROS SOLICITADOS: ${filters.join(', ') || "Ninguno"}
      4. PORCIONES: ${servings}

      Reglas obligatorias:
      - PRIORIZA el uso de ingredientes que caducan en menos de 3 días.
      - RESPETA estrictamente las alergias: si el usuario es alérgico a algo, NO incluyas esos ingredientes.
      - SÓLO usa herramientas de cocina que el usuario tiene registradas.
      - Asigna una de estas 50 URLs de imagen (elige la más relevante para el platillo):
        [Aquí va tu lista de las 50 URLs que ya definimos en el código anterior]
      
      Devuelve SOLO un JSON con 2 objetos con esta estructura exacta:
      [{
        "name": "Nombre corto",
        "tags": ["Tag1", "Tag2"],
        "time": 30,
        "servings": ${servings},
        "rating": 4.8,
        "image": "LA_URL_ELEGIDA",
        "description": "Descripción apetitosa",
        "missingIngredients": [{"name": "Sal", "qty": "1", "unit": "pizca"}],
        "ownedIngredients": [{"name": "Tomate", "qty": "2", "unit": "pzas"}],
        "steps": [
          { "step": 1, "title": "Titulo paso", "instruction": "Descripción...", "time": 5 }
        ],
        "nutrition": { "calorias": "300 kcal", "proteina": "10g", "carbohidratos": "20g", "grasas": "5g" }
      }]
    `;

    const contents: any[] = [{ role: 'user', parts: [{ text: prompt }] }];

    if (imageBase64) {
      const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
      contents[0].parts.push({ inlineData: { data: base64Data, mimeType: "image/jpeg" } });
    }

    const result = await model.generateContent({
      contents,
      generationConfig: { responseMimeType: "application/json" }
    });

    const textResponse = result.response.text().trim();
    const data = JSON.parse(textResponse);

    return NextResponse.json(data);

  } catch (error: any) {
  console.error("Error generando recetas:", error);
  
  // Detectar error de cuota específica
  if (error.status === 429 || error.message?.includes("Quota exceeded")) {
    return NextResponse.json({ 
      error: "Límite de la IA alcanzado", 
      message: "Hoy agotaste tus 20 consultas gratuitas. Intenta mañana o cambia la API Key." 
    }, { status: 429 });
  }

  return NextResponse.json({ error: error.message || "Error desconocido" }, { status: 500 });
}
}