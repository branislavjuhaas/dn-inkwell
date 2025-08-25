import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";

const ratingSchema = z.object({
  overall_mood_score: z.number().min(0).max(100),
  energy_level: z.number().min(0).max(100),
  emotional_complexity: z.number().min(0).max(100),
  dominant_emotions: z.array(
    z.enum([
      "joy",
      "gratitude",
      "serenity",
      "interest",
      "hope",
      "pride",
      "amusement",
      "love",
      "awe",
      "sadness",
      "anger",
      "fear",
      "anxiety",
      "guilt",
      "shame",
      "disgust",
      "loneliness",
      "fatigue",
      "boredom",
      "surprise",
      "confusion",
      "nostalgia",
      "ambivalence",
    ])
  ),
});

export const getAIAnalysis = async (entry: string) => {
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
  const config = {
    thinkingConfig: {
      thinkingBudget: -1,
    },
    responseMimeType: "application/json",
    responseSchema: {
      type: Type.OBJECT,
      required: [
        "overall_mood_score",
        "energy_level",
        "emotional_complexity",
        "dominant_emotions",
      ],
      properties: {
        overall_mood_score: {
          type: Type.INTEGER,
          description:
            "The net valence of the emotional state, from 0 (most negative) to 100 (most positive).",
        },
        energy_level: {
          type: Type.INTEGER,
          description:
            "Emotional arousal level, from 0 (lethargic, passive) to 100 (highly energetic, agitated).",
        },
        emotional_complexity: {
          type: Type.INTEGER,
          description:
            "Score from 0 (emotionally simple) to 100 (highly complex, conflicting emotions).",
        },
        dominant_emotions: {
          type: Type.ARRAY,
          description:
            "An array of the top 3-5 detected emotions from the predefined lowercase list.",
          items: {
            type: Type.STRING,
            enum: [
              "joy",
              "gratitude",
              "serenity",
              "interest",
              "hope",
              "pride",
              "amusement",
              "love",
              "awe",
              "sadness",
              "anger",
              "fear",
              "anxiety",
              "guilt",
              "shame",
              "disgust",
              "loneliness",
              "fatigue",
              "boredom",
              "surprise",
              "confusion",
              "nostalgia",
              "ambivalence",
            ],
          },
        },
      },
    },
    systemInstruction: [
      {
        text: `You are an expert AI specializing in sentiment analysis with a deep understanding of human psychology. Your objective is to analyze the provided diary entry and provide a multi-faceted mood analysis.

You MUST only use emotions from the predefined Emotion Vocabulary for the \`dominant_emotions\` field. The output for this field MUST be in English, regardless of the entry's language.`,
      },
    ],
  };
  const model = "gemini-2.5-flash";
  const contents = [
    {
      role: "user",
      parts: [
        {
          text: `Please, analyze following diary entry: \n\n ${entry}`,
        },
      ],
    },
  ];

  const response = await ai.models.generateContent({
    model,
    config,
    contents,
  });

  const parsedAnalysis = ratingSchema.safeParse(
    JSON.parse(response.text as string)
  );

  if (parsedAnalysis.success) {
    return parsedAnalysis.data;
  } else {
    throw new Error("Failed to parse analysis");
  }
};
