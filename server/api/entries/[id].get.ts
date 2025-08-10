import prisma from "~~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["Entries"],
    summary: "Get Entry by ID",
    description:
      "Retrieve a specific journal entry by its ID. Returns the entry with full details including mentions and AI-generated ratings. Users can only access their own entries.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        description: "Unique identifier of the entry to retrieve",
      },
    ],
    responses: {
      200: {
        description: "Entry retrieved successfully",
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
        description: "Bad request - Invalid entry ID",
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
                data: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    message: { type: "string" },
                  },
                },
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
        description: "Forbidden - User can only access their own entries",
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
      404: {
        description: "Not Found - Entry with the specified ID does not exist",
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

  const entry = await prisma.entry.findUnique({
    where: {
      id: Number(getRouterParam(event, "id")),
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

  if (!entry) {
    throw createError({
      statusCode: 404,
      statusMessage: "Entry not found",
    });
  }

  if (entry.authorId !== (session.user as any).id) {
    throw createError({
      statusCode: 403,
      statusMessage: "Forbidden",
    });
  }

  return {
    entry,
  };
});
