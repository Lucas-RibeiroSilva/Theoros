/*
  Warnings:

  - You are about to alter the column `display` on the `Traits` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.

*/
-- AlterTable
ALTER TABLE "Traits" ALTER COLUMN "display" SET DATA TYPE VARCHAR(100);
