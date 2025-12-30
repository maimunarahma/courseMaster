import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const callGemini = async (prompt: string): Promise<string> => {
  try {
    console.log("Calling Gemini API with prompt length:", prompt.length);

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents : 
         prompt
        
    });

    console.log("Gemini API Response received");

    const text = response.text;
    
    if (!text) {
      console.error("No text in Gemini response");
      throw new Error("No text generated from Gemini API");
    }

    return text;
  } catch (err: any) {
    console.error("Error calling Gemini API:");
    console.error("Error Message:", err.message);
    console.error("Error Details:", err);
    throw new Error(`Failed to call Gemini API: ${err.message}`);
  }
};
