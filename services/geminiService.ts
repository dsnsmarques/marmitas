
import { GoogleGenAI, Type } from "@google/genai";

// Initialize Gemini AI only if API key is available
const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const suggestMenu = async (currentItems: string[]) => {
  if (!ai) {
    console.warn("Gemini API key not configured. Menu suggestions are disabled.");
    return [];
  }
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Com base nesses itens de cardápio de marmita: ${currentItems.join(', ')}. Sugira 3 novos itens deliciosos para cada categoria: Principal, Mistura, Guarnição e Salada.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              category: { type: Type.STRING },
            },
            required: ["name", "category"],
          }
        }
      }
    });

    // Access the text property directly on the response object.
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Erro ao sugerir cardápio:", error);
    return [];
  }
};
