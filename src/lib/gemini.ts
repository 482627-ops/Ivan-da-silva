import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp: string;
}

export interface SentimentData {
  time: string;
  engagement: number;
}

export interface CoachingCard {
  strengths: string[];
  opportunities: string[];
}

export interface AnalysisResult {
  transcript: TranscriptEntry[];
  sentiment: SentimentData[];
  coaching: CoachingCard;
}

export async function analyzeSalesCall(audioBase64: string, mimeType: string): Promise<AnalysisResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: [
      {
        parts: [
          {
            text: `Analyze this sales call audio. 
            1. Provide a diarized transcript with Speaker A (Salesperson) and Speaker B (Customer). Include timestamps in MM:SS format.
            2. Provide a sentiment/engagement graph data (array of time in MM:SS and engagement level 0-100). Provide at least 10 data points across the duration.
            3. Provide a coaching card with exactly 3 things the salesperson did well (strengths) and 3 missed opportunities.
            Return the result in JSON format following the schema.`,
          },
          {
            inlineData: {
              mimeType,
              data: audioBase64,
            },
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          transcript: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                speaker: { type: Type.STRING },
                text: { type: Type.STRING },
                timestamp: { type: Type.STRING },
              },
              required: ["speaker", "text", "timestamp"],
            },
          },
          sentiment: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                engagement: { type: Type.NUMBER },
              },
              required: ["time", "engagement"],
            },
          },
          coaching: {
            type: Type.OBJECT,
            properties: {
              strengths: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              opportunities: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["strengths", "opportunities"],
          },
        },
        required: ["transcript", "sentiment", "coaching"],
      },
    },
  });

  try {
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Invalid response format from AI");
  }
}
