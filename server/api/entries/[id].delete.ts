import prisma from "~~/lib/prisma";

defineRouteMeta({
  openAPI: {
    tags: ["Entries"],
    summary: "Delete Entry",
    description:
      "Delete a specific journal entry by its ID. Users can only delete their own entries. Deleting an entry will also remove any associated ratings and emotional analysis data.",
    parameters: [
      {
        name: "id",
        in: "path",
        required: true,
        schema: {
          type: "integer",
          minimum: 1,
        },
        description: "Unique identifier of the entry to delete",
      },
    ],
    responses: {
      204: {
        description: "Entry deleted successfully - No content returned",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: {
                  type: "integer",
                  example: 204,
                  description:
                    "HTTP status code indicating successful deletion",
                },
              },
              required: ["statusCode"],
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
        description: "Forbidden - User can only delete their own entries",
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
    where: { id: Number(getRouterParam(event, "id")) },
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
      statusMessage: "You are not allowed to delete this entry",
    });
  }

  await prisma.entry.delete({
    where: { id: entry.id },
  });

  setResponseStatus(event, 204, "Entry deleted successfully");
});
