import { GoogleGenAI, Type } from "@google/genai";
import { z } from "zod";
import prisma from "~~/lib/prisma";
import type { Emotion } from "@prisma/client";

const rate = async (entry: string) => {
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

  return response.text;
};

const ratingSchema = z.object({
  overall_mood_score: z.number().min(0).max(100),
  energy_level: z.number().min(0).max(100),
  emotional_complexity: z.number().min(0).max(100),
  dominant_emotions: z
    .array(
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
    )
    .min(3)
    .max(5),
});

export default defineTask({
  meta: {
    name: "entries:rate",
    description: "Rate journal entries based on user feedback",
  },
  async run() {
    const entries = await prisma.entry.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
        rating: null,
      },
    });

    console.log(`TASK RUN: Rate journal ${entries.length} entries`);

    for (const entry of entries) {
      const analysis = await rate(entry.content);

      const parsedAnalysis = ratingSchema.safeParse(
        JSON.parse(analysis as string)
      );
      if (parsedAnalysis.success) {
        await prisma.rating.create({
          data: {
            entryId: entry.id,
            overallMoodScore: parsedAnalysis.data.overall_mood_score,
            energyLevel: parsedAnalysis.data.energy_level,
            emotionalComplexity: parsedAnalysis.data.emotional_complexity,
            dominantEmotions: {
              create: parsedAnalysis.data.dominant_emotions.map((emotion) => ({
                emotion: emotion.toUpperCase() as Emotion,
              })),
            },
          },
        });
      } else {
        console.error(
          `Failed to parse analysis for entry ${entry.id}:`,
          parsedAnalysis.error
        );
      }
    }

    console.log("TASK DONE: Rate journal entries");
    return { result: "Task completed successfully" };
  },
});
