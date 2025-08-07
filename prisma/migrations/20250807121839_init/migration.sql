-- CreateTable
CREATE TABLE "users" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login" DATETIME DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birthdate" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "people" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "search" TEXT,
    "note" TEXT,
    "owner_id" INTEGER NOT NULL,
    CONSTRAINT "people_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "entries" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "date" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "textContent" TEXT NOT NULL,
    "author_id" INTEGER NOT NULL,
    CONSTRAINT "entries_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ratings" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "overall_mood_score" INTEGER NOT NULL,
    "energy_level" INTEGER NOT NULL,
    "emotional_complexity" INTEGER NOT NULL,
    "entry_id" INTEGER NOT NULL,
    CONSTRAINT "ratings_entry_id_fkey" FOREIGN KEY ("entry_id") REFERENCES "entries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "rating_emotions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "rating_id" INTEGER NOT NULL,
    "emotion" TEXT NOT NULL,
    CONSTRAINT "rating_emotions_rating_id_fkey" FOREIGN KEY ("rating_id") REFERENCES "ratings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_EntryToPerson" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_EntryToPerson_A_fkey" FOREIGN KEY ("A") REFERENCES "entries" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_EntryToPerson_B_fkey" FOREIGN KEY ("B") REFERENCES "people" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "people_owner_id_idx" ON "people"("owner_id");

-- CreateIndex
CREATE INDEX "people_search_idx" ON "people"("search");

-- CreateIndex
CREATE UNIQUE INDEX "people_name_surname_owner_id_key" ON "people"("name", "surname", "owner_id");

-- CreateIndex
CREATE INDEX "entries_author_id_idx" ON "entries"("author_id");

-- CreateIndex
CREATE INDEX "entries_date_idx" ON "entries"("date");

-- CreateIndex
CREATE INDEX "entries_author_id_date_idx" ON "entries"("author_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "ratings_entry_id_key" ON "ratings"("entry_id");

-- CreateIndex
CREATE INDEX "ratings_overall_mood_score_idx" ON "ratings"("overall_mood_score");

-- CreateIndex
CREATE INDEX "ratings_energy_level_idx" ON "ratings"("energy_level");

-- CreateIndex
CREATE INDEX "ratings_entry_id_idx" ON "ratings"("entry_id");

-- CreateIndex
CREATE INDEX "ratings_created_at_idx" ON "ratings"("created_at");

-- CreateIndex
CREATE INDEX "rating_emotions_rating_id_idx" ON "rating_emotions"("rating_id");

-- CreateIndex
CREATE INDEX "rating_emotions_emotion_idx" ON "rating_emotions"("emotion");

-- CreateIndex
CREATE UNIQUE INDEX "rating_emotions_rating_id_emotion_key" ON "rating_emotions"("rating_id", "emotion");

-- CreateIndex
CREATE UNIQUE INDEX "_EntryToPerson_AB_unique" ON "_EntryToPerson"("A", "B");

-- CreateIndex
CREATE INDEX "_EntryToPerson_B_index" ON "_EntryToPerson"("B");
