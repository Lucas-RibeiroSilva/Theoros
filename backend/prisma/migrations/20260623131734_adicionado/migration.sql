/*
  Warnings:

  - Added the required column `health` to the `Card` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "health" INTEGER NOT NULL;
