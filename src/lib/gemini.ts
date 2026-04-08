import { GoogleGenAI, ThinkingLevel } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("GEMINI_API_KEY is not set. AI features will not work.");
}

const ai = new GoogleGenAI({ apiKey: apiKey || "" });

export async function* summarizeTextStream(text: string, length: 'short' | 'medium' | 'long' = 'medium') {
  if (!apiKey) throw new Error("API key missing");

  const lengthInstructions = {
    short: "Summarize the text in 2-3 concise bullet points.",
    medium: "Summarize the text in 4-6 bullet points, focusing on key ideas.",
    long: "Provide a detailed point-wise summary with 8-10 bullet points, covering all main points."
  };

  try {
    const stream = await ai.models.generateContentStream({
      model: "gemini-3.1-flash-lite-preview", // Fastest model for simple text tasks
      contents: [
        {
          parts: [
            { text: `${lengthInstructions[length]}\n\nText to summarize:\n${text}` }
          ]
        }
      ],
      config: {
        temperature: 0.3, // Even lower for maximum speed and focus
        topP: 0.8,
        thinkingConfig: {
          thinkingLevel: ThinkingLevel.MINIMAL // Absolute minimum latency
        }
      }
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
}
