import { z } from "zod";
import prisma from "~~/lib/prisma";

const entrySchema = z.object({
  month: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(12))
    .optional(),
  year: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(2000).max(new Date().getFullYear()))
    .optional(),
});

defineRouteMeta({
  openAPI: {
    tags: ["Entries"],
    summary: "Retrieve user's entries",
    description:
      "Retrieve a feed of entries for the authenticated user within a specified date range. Returns entries with basic information (id and date) for the given month and year.",
    parameters: [
      {
        name: "month",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 1,
          maximum: 12,
        },
        description:
          "Month to filter entries (1-12). Defaults to current month.",
      },
      {
        name: "year",
        in: "query",
        required: false,
        schema: {
          type: "integer",
          minimum: 2000,
          maximum: new Date().getFullYear(),
        },
        description: "Year to filter entries. Defaults to current year.",
      },
    ],
    responses: {
      200: {
        description: "Feed retrieved successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                entries: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      id: {
                        type: "integer",
                        description: "Unique identifier of the entry",
                      },
                      date: {
                        type: "string",
                        description: "Date of the entry in YYYY-MM-DD format",
                      },
                    },
                    required: ["id", "date"],
                  },
                },
              },
              required: ["entries"],
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

  const { month = new Date().getMonth() + 1, year = new Date().getFullYear() } =
    await getValidatedQuery(event, (query) => entrySchema.parse(query));

  const entries = await prisma.entry.findMany({
    where: {
      authorId: Number((session.user as any).id),
      date: {
        gte: `${year}-${String(month - 1).padStart(2, "0")}-01`,
        lt: `${year}-${String(month + 2).padStart(2, "0")}-01`,
      },
    },
    select: {
      id: true,
      date: true,
    },
  });

  return {
    entries,
  };
});
