
import { GoogleGenAI, Type } from "@google/genai";

// Always use named parameters and avoid logical OR with empty string for apiKey.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const suggestMenu = async (currentItems: string[]) => {
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
