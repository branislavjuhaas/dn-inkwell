import { z } from "zod";
import prisma from "~~/lib/prisma";

const entrySchema = z.object({
  content: z.string().optional(),
  text: z.string().optional(),
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
    summary: "Update Entry",
    description:
      "Partially update an existing journal entry. Users can only update their own entries. All fields are optional - only provided fields will be updated, existing values are preserved for omitted fields. Updating an entry will remove any existing AI-generated rating since the content may have changed.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        description: "Unique identifier of the entry to update",
      },
    ],
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
                  "The rich content of the journal entry (HTML/markdown format). If not provided, existing content is preserved.",
              },
              text: {
                type: "string",
                description:
                  "Plain text version of the entry content for processing. If not provided, existing text content is preserved.",
              },
              mentions: {
                type: "array",
                items: {
                  type: "integer",
                },
                minItems: 1,
                description:
                  "Optional array of person IDs mentioned in this entry. This will replace all existing mentions. If not provided, existing mentions are preserved.",
              },
              date: {
                type: "string",
                format: "date",
                description:
                  "Date of the entry in YYYY-MM-DD format. If not provided, defaults to current date.",
              },
            },
            additionalProperties: false,
          },
        },
      },
    },
    responses: {
      200: {
        description: "Entry updated successfully",
        content: {
          "application/json": {
            schema: {
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
                  description: "Timestamp when the entry was last updated",
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
                          emotion: { type: "string" },
                          ratingId: { type: "integer" },
                        },
                      },
                    },
                  },
                  description:
                    "AI-generated mood and emotional rating for the entry (will be null after update until re-analyzed)",
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
        },
      },
      400: {
        description: "Bad request - Invalid input data or entry ID",
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
        description: "Forbidden - User can only update their own entries",
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

  const body = await readValidatedBody(event, (body) =>
    entrySchema.parse(body)
  );

  // Build update payload only with provided fields
  const updateData: any = {};

  // Determine if rating should be deleted (only when text actually changes)
  const deleteRating =
    body.text !== undefined && body.text !== entry.textContent && entry.rating;

  // Delete rating first if text content is changing
  if (deleteRating && entry.rating) {
    // Delete rating emotions first, then the rating (cascade delete)
    await prisma.ratingEmotion.deleteMany({
      where: { ratingId: entry.rating.id },
    });

    await prisma.rating.delete({
      where: { entryId: entry.id },
    });
  }

  if (body.content !== undefined) updateData.content = body.content;
  if (body.text !== undefined) updateData.textContent = body.text;

  // Preserve previous behavior: if date not provided, use current date
  updateData.date = body.date || new Date().toISOString().split("T")[0];

  if (body.mentions) {
    updateData.mentions = {
      set: body.mentions.map((id) => ({ id })),
    };
  }

  const updatedEntry = await prisma.entry.update({
    where: { id: entry.id },
    data: updateData,
    include: {
      mentions: true,
      rating: { include: { dominantEmotions: true } },
    },
  });

  // Return the updated entry
  return updatedEntry;
});
