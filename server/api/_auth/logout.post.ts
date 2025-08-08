defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    summary: "User Logout",
    description: "Endpoint for user logout, clearing the user session.",
    responses: {
      200: {
        description: "Logout successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
              },
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
  await requireUserSession(event);
  await clearUserSession(event);

  return {
    statusCode: 200,
    statusMessage: "Success",
    message: "User logged out successfully",
  };
});
