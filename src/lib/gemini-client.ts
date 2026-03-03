import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

// Translation using Gemini Flash
export async function translateTexts(
  texts: string[],
  targetLanguage: "hi" | "ur"
): Promise<string[]> {
  const languageName = targetLanguage === "hi" ? "Hindi" : "Urdu";
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Translate the following product names and descriptions from English to ${languageName}.
Return ONLY a JSON array of translated strings in the same order.
Keep brand names (TRS, East End, Cofresh, Fudco, Vibrant Foods) untranslated.
Keep weights, sizes, and prices in original format (e.g., "500g", "£4.99").

Input: ${JSON.stringify(texts)}`;

  const result = await model.generateContent(prompt);
  const response = result.response.text();

  // Parse the JSON response
  try {
    // Find JSON array in the response
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch {
    // Fallback: return original texts
  }

  return texts;
}

// AI Flyer generation using Nano Banana Pro
export async function generateFlyerImage(prompt: string): Promise<string | null> {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseModalities: ["TEXT", "IMAGE"],
          },
        }),
      }
    );

    const data = await response.json();

    // Extract image from response
    if (data.candidates?.[0]?.content?.parts) {
      for (const part of data.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }

    return null;
  } catch (error) {
    console.error("Flyer generation error:", error);
    return null;
  }
}
