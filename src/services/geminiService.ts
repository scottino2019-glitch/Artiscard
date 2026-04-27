import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenAI({ apiKey });

export async function generateArtBackground(mood: string, style: string) {
  const prompt = `Describe a visually stunning, artistic background for a postcard. 
  Mood: ${mood}. Style: ${style}. 
  Provide a detailed artistic description. 
  The description should be used as a prompt for an image generator.`;

  try {
    const result = await genAI.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });
    return result.text || "A beautiful artistic background with soft transitions and elegant textures.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "A beautiful artistic background with soft transitions and elegant textures.";
  }
}
