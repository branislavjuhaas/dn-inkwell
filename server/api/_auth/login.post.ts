import { z } from "zod";
import prisma from "~~/lib/prisma";

export const LoginSchema = z.object({
  email: z.string(),
  password: z.string(),
});

defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    summary: "User Login",
    description:
      "Endpoint for user login using email and password credentials.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
            },
            required: ["email", "password"],
          },
        },
      },
    },
    responses: {
      200: {
        description: "Login successful",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                statusCode: { type: "integer" },
                statusMessage: { type: "string" },
                message: { type: "string" },
                user: {
                  type: "object",
                  properties: {
                    id: { type: "string" },
                    email: { type: "string", format: "email" },
                  },
                  required: ["id", "email"],
                },
              },
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
        description: "Unauthorized - User not found or invalid password",
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
    },
  },
});

export default defineEventHandler(async (event) => {
  const body = await readValidatedBody(event, (body) =>
    LoginSchema.parse(body)
  );

  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "User not found",
    });
  }

  if (!(await verifyPassword(user.password, body.password))) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
      message: "Invalid password",
    });
  }

  await setUserSession(event, {
    user: {
      id: user.id,
      email: user.email,
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLogin: new Date() },
  });

  return {
    statusCode: 200,
    statusMessage: "Success",
    message: "Login successful",
    user: user,
  };
});
