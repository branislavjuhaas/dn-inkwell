import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer, unique, primaryKey, } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'

export const entry = sqliteTable('entry', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  authorId: integer('author_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').default(sql`(CURRENT_DATE)`).notNull(),
  content: text('content').notNull(),
  rating: text('rating', { mode: 'json' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  unique().on(table.authorId, table.date)
])

export const rating = sqliteTable('rating', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  raterId: integer('rater_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').default(sql`(CURRENT_DATE)`).notNull(),
  score: integer('score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

export const person = sqliteTable('person', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  surname: text('surname').notNull(),
  nickname: text('nickname'),
  ownerId: integer('owner_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

// Many-to-Many relationship table between Person and Entry
export const personsRelations = relations(person, ({ many }) => ({
  mentions: many(mention),
}))

export const entriesRelations = relations(entry, ({ many }) => ({
  mentions: many(mention),
}))

export const mention = sqliteTable('mention', {
  personId: integer('person_id').references(() => person.id, { onDelete: 'cascade' }).notNull(),
  entryId: integer('entry_id').references(() => entry.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  primaryKey({ columns: [table.personId, table.entryId ]})
])