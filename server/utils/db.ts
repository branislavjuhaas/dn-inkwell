import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from '../database/schema'
import * as authSchema from '../database/auth-schema'

const sqlite = new Database(process.env.DB_FILE_NAME!)
export const db = drizzle(sqlite, { schema: {
		...schema,
		...authSchema,
	}, })
