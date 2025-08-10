import { z } from "zod";
import prisma from "~~/lib/prisma";

export const SignupSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_])[A-Za-z\d@$!%*?&_]+$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
    ),
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters"),
  surname: z
    .string()
    .min(1, "Surname is required")
    .max(50, "Surname must not exceed 50 characters"),
  birthdate: z.string().refine(
    (value) => {
      const date = new Date(value);
      return !isNaN(date.getTime()) && date <= new Date();
    },
    {
      message: "Birthdate must be a valid date in the past",
    }
  ),
});

defineRouteMeta({
  openAPI: {
    tags: ["Authentication"],
    summary: "User Signup",
    description:
      "Endpoint for user registration with email, password, name, surname, and birthdate.",
    requestBody: {
      required: true,
      content: {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              email: { type: "string", format: "email" },
              password: { type: "string" },
              name: { type: "string" },
              surname: { type: "string" },
              birthdate: { type: "string" },
            },
            required: ["email", "password", "name", "surname", "birthdate"],
          },
        },
      },
    },
    responses: {
      201: {
        description: "User created successfully",
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                message: { type: "string" },
              },
            },
          },
        },
      },
      400: {
        description: "Bad request - Invalid input data",
      },
      409: {
        description: "Conflict - User already exists",
      },
    },
  },
});

export default defineEventHandler(async (event) => {
  const userData = await readValidatedBody(event, (body) =>
    SignupSchema.parse(body)
  );

  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw createError({
      statusCode: 409,
      statusMessage: "User already exists",
    });
  }

  userData.password = await hashPassword(userData.password);

  const user = await prisma.user.create({
    data: {
      ...userData,
    },
  });

  return {
    statusCode: 201,
    message: "User created successfully",
    userId: user.id,
  };
});
