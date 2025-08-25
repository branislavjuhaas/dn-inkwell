-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    CONSTRAINT "entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_entries" ("author_id", "content", "created_at", "date", "id", "textContent") SELECT "author_id", "content", "created_at", "date", "id", "textContent" FROM "entries";
DROP TABLE "entries";
ALTER TABLE "new_entries" RENAME TO "entries";
CREATE INDEX "entries_author_id_idx" ON "entries"("author_id");
CREATE INDEX "entries_date_idx" ON "entries"("date");
CREATE INDEX "entries_author_id_date_idx" ON "entries"("author_id", "date");
CREATE TABLE "new_people" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "search" TEXT,
    "note" TEXT,
    "owner_id" INTEGER NOT NULL,
    CONSTRAINT "people_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_people" ("created_at", "id", "name", "note", "owner_id", "search", "surname") SELECT "created_at", "id", "name", "note", "owner_id", "search", "surname" FROM "people";
DROP TABLE "people";
ALTER TABLE "new_people" RENAME TO "people";
CREATE INDEX "people_owner_id_idx" ON "people"("owner_id");
CREATE INDEX "people_search_idx" ON "people"("search");
CREATE UNIQUE INDEX "people_name_surname_owner_id_key" ON "people"("name", "surname", "owner_id");
CREATE TABLE "new_rating_emotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating_id" INTEGER NOT NULL,
    "emotion" TEXT NOT NULL,
    CONSTRAINT "rating_emotions_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "ratings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_rating_emotions" ("emotion", "id", "rating_id") SELECT "emotion", "id", "rating_id" FROM "rating_emotions";
DROP TABLE "rating_emotions";
ALTER TABLE "new_rating_emotions" RENAME TO "rating_emotions";
CREATE INDEX "rating_emotions_rating_id_idx" ON "rating_emotions"("rating_id");
CREATE INDEX "rating_emotions_emotion_idx" ON "rating_emotions"("emotion");
CREATE UNIQUE INDEX "rating_emotions_rating_id_emotion_key" ON "rating_emotions"("rating_id", "emotion");
CREATE TABLE "new_ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_mood_score" INTEGER NOT NULL,
    "energy_level" INTEGER NOT NULL,
    "emotional_complexity" INTEGER NOT NULL,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "ratings_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ratings" ("created_at", "emotional_complexity", "energy_level", "entry_id", "id", "overall_mood_score") SELECT "created_at", "emotional_complexity", "energy_level", "entry_id", "id", "overall_mood_score" FROM "ratings";
DROP TABLE "ratings";
ALTER TABLE "new_ratings" RENAME TO "ratings";
CREATE UNIQUE INDEX "ratings_entry_id_key" ON "ratings"("entry_id");
CREATE INDEX "ratings_overall_mood_score_idx" ON "ratings"("overall_mood_score");
CREATE INDEX "ratings_energy_level_idx" ON "ratings"("energy_level");
CREATE INDEX "ratings_entry_id_idx" ON "ratings"("entry_id");
CREATE INDEX "ratings_created_at_idx" ON "ratings"("created_at");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
