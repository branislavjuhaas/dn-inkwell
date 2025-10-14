import { relations, sql } from 'drizzle-orm'
import { sqliteTable, text, integer, unique, primaryKey, } from 'drizzle-orm/sqlite-core'
import { user } from './auth-schema'

// ENTRY

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

export const entryRelations = relations(entry, ({ one, many }) => ({
  author: one(user, {
    fields: [entry.authorId],
    references: [user.id],
    relationName: 'user_entries'
  }),
  comments: many(comment, { relationName: 'entry_comments' }),
  mentions: many(mention, { relationName: 'entry_mentions' }),
}))

// COMMENT

export const comment = sqliteTable('comment', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  entryId: integer('entry_id').references(() => entry.id, { onDelete: 'cascade' }).notNull(),
  text: text('text').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

export const commentRelations = relations(comment, ({ one }) => ({
  entry: one(entry, {
    fields: [comment.entryId],
    references: [entry.id],
    relationName: 'entry_comments'
  }),
}))

// RATING

export const rating = sqliteTable('rating', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  raterId: integer('rater_id').references(() => user.id, { onDelete: 'cascade' }).notNull(),
  date: text('date').default(sql`(CURRENT_DATE)`).notNull(),
  score: integer('score').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
})

export const ratingRelations = relations(rating, ({ one }) => ({
  rater: one(user, {
    fields: [rating.raterId],
    references: [user.id],
    relationName: 'user_ratings'
  }),
}))

// PERSON

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

export const personRelations = relations(person, ({ one, many }) => ({
  owner: one(user, {
    fields: [person.ownerId],
    references: [user.id],
    relationName: 'user_persons'
  }),
  mentions: many(mention, { relationName: 'person_mentions' }),
}))

// MENTION (JOIN TABLE)

export const mention = sqliteTable('mention', {
  personId: integer('person_id').references(() => person.id, { onDelete: 'cascade' }).notNull(),
  entryId: integer('entry_id').references(() => entry.id, { onDelete: 'cascade' }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
    .notNull(),
}, (table) => [
  primaryKey({ columns: [table.personId, table.entryId ]})
])

export const mentionRelations = relations(mention, ({ one }) => ({
  person: one(person, {
    fields: [mention.personId],
    references: [person.id],
    relationName: 'person_mentions'
  }),
  entry: one(entry, {
    fields: [mention.entryId],
    references: [entry.id],
    relationName: 'entry_mentions'
  }),
}))