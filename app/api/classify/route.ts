import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: Request) {
  try {
    const { ingredient } = await request.json();

    if (!ingredient) {
      return NextResponse.json({ error: 'Ingrediente no proporcionado' }, { status: 400 });
    }

    // Usamos el alias "-latest" para evitar el error 404 de versión
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      Eres un asistente experto en clasificación de alimentos y seguridad alimentaria. 
      Analiza el siguiente ingrediente: "${ingredient}".
      
      Debes devolver ÚNICAMENTE un objeto JSON válido con estas 4 propiedades:
      1. "category": Solo puede ser una de estas opciones exactas: "Vegetales", "Frutas", "Lácteos", "Granos", "Proteínas", "Condimentos".
      2. "icon": Un solo emoji que represente mejor al ingrediente.
      3. "daysToExpire": Un número entero que represente la cantidad aproximada de días que este ingrediente dura fresco si se almacena correctamente.
      4. "location": El mejor lugar para guardarlo. Solo puede ser una de estas tres opciones: "Refrigerador", "Alacena", "Congelador".
      5. "correctedName": Corrige la ortografía y pon la primera letra en mayúscula (ej. "sal de himalahia" -> "Sal del Himalaya"). 
         ¡MUY IMPORTANTE!: Si el ingrediente significa lo mismo o es un sinónimo de alguno que el usuario YA TIENE en su alacena, DEBES devolver EXACTAMENTE el nombre como aparece en la alacena del usuario para evitar duplicados.

      Ejemplo de respuesta si te digo "Cebolla morada":
      {
        "category": "Vegetales",
        "icon": "🧅",
        "daysToExpire": 30,
        "location": "Alacena"
      }
      
      Devuelve SOLO el JSON puro, sin texto adicional.
    `;

    const result = await model.generateContent(prompt);
    const textResponse = result.response.text().trim();
    
    const cleanJson = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(cleanJson);

    return NextResponse.json(data);

  } catch (error) {
    console.error("Error clasificando con Gemini:", error);
    return NextResponse.json({ error: 'Error al clasificar' }, { status: 500 });
  }
}