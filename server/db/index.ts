import { drizzle } from "drizzle-orm/better-sqlite3";

export const db = drizzle({ connection: process.env.DATABASE_URL, casing: 'snake_case' })