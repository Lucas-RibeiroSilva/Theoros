/*
  Warnings:

  - You are about to drop the column `rating` on the `Ratings` table. All the data in the column will be lost.
  - Added the required column `score` to the `Ratings` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Ratings_cardId_rating_idx";

-- AlterTable
ALTER TABLE "Ratings" DROP COLUMN "rating",
ADD COLUMN     "score" INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX "Ratings_cardId_score_idx" ON "Ratings"("cardId", "score");
