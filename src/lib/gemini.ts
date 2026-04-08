import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function summarizeText(text: string, length: 'short' | 'medium' | 'long' = 'medium') {
  if (!apiKey) throw new Error("API key missing");

  const lengthInstructions = {
    short: "Summarize the text in 2-3 concise bullet points.",
    medium: "Summarize the text in 4-6 bullet points, focusing on key ideas.",
    long: "Provide a detailed point-wise summary with 8-10 bullet points, covering all main points."
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: `${lengthInstructions[length]}\n\nText to summarize:\n${text}` }
          ]
        }
      ],
      config: {
        temperature: 0.7,
        topP: 0.95,
      }
    });

    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
