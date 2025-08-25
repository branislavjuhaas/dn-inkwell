import { Emotion } from "@prisma/client";
import { z } from "zod";
import prisma from "~~/lib/prisma";
import { getAIAnalysis } from "~~/server/utils/analysis";
import { parseTextFromHtml } from "~~/server/utils/parser";

const entrySchema = z.object({
  content: z.string(),
  mentions: z.array(z.int()).min(1).optional(),
  date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["Entries"],
    summary: "Create Entry",
    description:
      "Create a new journal entry for the authenticated user. The entry must include `content`; `mentions` and `date` are optional.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              content: {
                type: "string",
                description:
                  "The rich content of the journal entry (HTML/markdown format)",
              },
              mentions: {
                type: "array",
                items: {
                  type: "integer",
                },
                description:
                  "Optional array of person IDs mentioned in this entry",
              },
              date: {
                type: "string",
                format: "date",
                description:
                  "Date of the entry in YYYY-MM-DD format. Defaults to current date if not provided.",
              },
            },
            required: ["content"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "Entry created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                entry: {
                  type: "object",
                  properties: {
                    id: {
                      type: "integer",
                      description: "Unique identifier of the entry",
                    },
                    content: {
                      type: "string",
                      description: "The rich content of the journal entry",
                    },
                    textContent: {
                      type: "string",
                      description: "Plain text version of the entry content",
                    },
                    date: {
                      type: "string",
                      description: "Date of the entry in YYYY-MM-DD format",
                    },
                    authorId: {
                      type: "integer",
                      description: "ID of the user who created the entry",
                    },
                    createdAt: {
                      type: "string",
                      format: "date-time",
                      description: "Timestamp when the entry was created",
                    },
                    mentions: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "integer" },
                          name: { type: "string" },
                          surname: { type: "string" },
                          note: { type: "string", nullable: true },
                          createdAt: { type: "string", format: "date-time" },
                          ownerId: { type: "integer" },
                        },
                      },
                      description: "People mentioned in this entry",
                    },
                    rating: {
                      type: "object",
                      nullable: true,
                      properties: {
                        id: { type: "integer" },
                        overallMoodScore: { type: "integer" },
                        energyLevel: { type: "integer" },
                        emotionalComplexity: { type: "integer" },
                        createdAt: { type: "string", format: "date-time" },
                        entryId: { type: "integer" },
                        dominantEmotions: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              id: { type: "integer" },
                              emotion: {
                                type: "string",
                                enum: [
                                  "JOY",
                                  "GRATITUDE",
                                  "SERENITY",
                                  "INTEREST",
                                  "HOPE",
                                  "PRIDE",
                                  "AMUSEMENT",
                                  "LOVE",
                                  "AWE",
                                  "SADNESS",
                                  "ANGER",
                                  "FEAR",
                                  "ANXIETY",
                                  "GUILT",
                                  "SHAME",
                                  "DISGUST",
                                  "LONELINESS",
                                  "FATIGUE",
                                  "BOREDOM",
                                  "SURPRISE",
                                  "CONFUSION",
                                  "NOSTALGIA",
                                  "AMBIVALENCE",
                                ],
                              },
                            },
                          },
                          description:
                            "List of dominant emotions detected in the entry",
                        },
                      },
                      description:
                        "AI-generated mood and emotional rating for the entry",
                    },
                  },
                  required: [
                    "id",
                    "content",
                    "textContent",
                    "date",
                    "authorId",
                    "createdAt",
                    "mentions",
                  ],
                },
              },
              required: ["entry"],
            },
          },
        },
      },
      400: {
        description: "Bad request - Invalid input data",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "boolean" },
                url: { type: "string" },
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
                data: { type: "object" },
              },
              required: [
                "error",
                "url",
                "statusCode",
                "statusMessage",
                "message",
              ],
            },
          },
        },
      },
      401: {
        description: "Unauthorized - User session not found",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "boolean" },
                url: { type: "string" },
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
                data: { type: "object" },
              },
            },
          },
        },
      },
      403: {
        description: "Forbidden - Mention ownership violation",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                error: { type: "boolean" },
                url: { type: "string" },
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
                data: { type: "object" },
              },
            },
          },
        },
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const session = await requireUserSession(event);

  const body = await readValidatedBody(event, (body) =>
    entrySchema.parse(body)
  );

  // Check if ownership of mentions is violated
  const mentionOwners = await prisma.person.findMany({
    where: {
      id: {
        in: body.mentions || [],
      },
    },
    select: {
      id: true,
      ownerId: true,
    },
  });

  for (const mention of mentionOwners) {
    if (mention.ownerId !== (session.user as any).id) {
      throw createError({
        statusCode: 403,
        statusMessage: `You are not allowed to mention person with ID ${mention.id}`,
      });
    }
  }

  const text = parseTextFromHtml(body.content);
  const analysis = await getAIAnalysis(text);

  const entry = await prisma.entry.create({
    data: {
      content: body.content,
      textContent: text,
      mentions: body.mentions
        ? {
            connect: body.mentions.map((id) => ({ id })),
          }
        : undefined,
      date: body.date || `${new Date().toISOString().split("T")[0]}`,
      authorId: Number((session.user as any).id),
      rating: {
        create: {
          overallMoodScore: analysis.overall_mood_score,
          energyLevel: analysis.energy_level,
          emotionalComplexity: analysis.emotional_complexity,
          dominantEmotions: {
            create: analysis.dominant_emotions.map((emotion: string) => ({
              emotion: emotion.toUpperCase() as Emotion,
            })),
          },
        },
      },
    },
    include: {
      mentions: true,
      rating: {
        include: {
          dominantEmotions: true,
        },
      },
    },
  });

  return {
    entry,
  };
});
