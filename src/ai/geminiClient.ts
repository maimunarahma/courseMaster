import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const callGemini = async (prompt: string): Promise<string> => {
  if (!ai || !apiKey) {
    console.warn("Gemini API key not configured - skipping AI generation");
    return "AI generation is not available. Please set GEMINI_API_KEY environment variable.";
  }
  
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const text = response?.candidates?.[0]?.content?.parts
      ?.map((p: any) => p.text)
      .join("") || "";

    if (!text) throw new Error("Empty response from Gemini API");

    return text;
  } catch (err: any) {
    console.error("Gemini API error:", err);
    throw new Error(`Failed to call Gemini API: ${err.message}`);
  }
};
