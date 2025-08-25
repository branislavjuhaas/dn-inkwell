import { z } from "zod";
import prisma from "~~/lib/prisma";

const entrySchema = z.object({
  content: z.string(),
  text: z.string(),
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
      "Create a new journal entry for the authenticated user. The entry can include content, text content, optional mentions of people, and an optional date.",
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
              text: {
                type: "string",
                description:
                  "Plain text version of the entry content for processing",
              },
              mentions: {
                type: "array",
                items: {
                  type: "integer",
                },
                minItems: 1,
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
            required: ["content", "text"],
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
                      description: "Unique identifier of the created entry",
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
                  },
                  required: [
                    "id",
                    "content",
                    "textContent",
                    "date",
                    "authorId",
                    "createdAt",
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

  const entry = await prisma.entry.create({
    data: {
      content: body.content,
      textContent: body.text,
      mentions: body.mentions
        ? {
            connect: body.mentions.map((id) => ({ id })),
          }
        : undefined,
      date: body.date || `${new Date().toISOString().split("T")[0]}`,
      authorId: Number((session.user as any).id),
    },
  });

  return {
    entry,
  };
});
