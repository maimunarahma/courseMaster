import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || "";
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const callGemini = async (prompt: string, retries: number = 3): Promise<string> => {
  if (!ai || !apiKey) {
    console.warn("Gemini API key not configured - skipping AI generation");
    return "AI generation is not available. Please set GEMINI_API_KEY environment variable.";
  }
  
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000); // 30s

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
      lastError = err;
      console.error(`Gemini API error (attempt ${attempt}/${retries}):`, err);
      
      // Check if it's a 503 (high demand) error
      const errorMessage = err.message || JSON.stringify(err);
      const is503Error = errorMessage.includes("503") || errorMessage.includes("UNAVAILABLE") || errorMessage.includes("high demand");
      
      if (is503Error && attempt < retries) {
        // Wait before retrying (exponential backoff)
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Max 5 seconds
        console.log(`Retrying in ${waitTime}ms...`);
        await sleep(waitTime);
        continue;
      }
      
      // If not 503 or last attempt, throw error
      if (attempt === retries) {
        break;
      }
    }
  }
  
  throw new Error(`Failed to call Gemini API after ${retries} attempts: ${lastError.message}`);
};
