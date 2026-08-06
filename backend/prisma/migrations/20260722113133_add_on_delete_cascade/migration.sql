-- DropForeignKey
ALTER TABLE "CardExpansions" DROP CONSTRAINT "CardExpansions_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardExpertises" DROP CONSTRAINT "CardExpertises_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardLimitations" DROP CONSTRAINT "CardLimitations_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardMagics" DROP CONSTRAINT "CardMagics_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardTechniques" DROP CONSTRAINT "CardTechniques_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardTraits" DROP CONSTRAINT "CardTraits_cardId_fkey";

-- DropForeignKey
ALTER TABLE "CardsFavorites" DROP CONSTRAINT "CardsFavorites_cardId_fkey";

-- DropForeignKey
ALTER TABLE "Ratings" DROP CONSTRAINT "Ratings_cardId_fkey";

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardsFavorites" ADD CONSTRAINT "CardsFavorites_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTraits" ADD CONSTRAINT "CardTraits_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardLimitations" ADD CONSTRAINT "CardLimitations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpertises" ADD CONSTRAINT "CardExpertises_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpansions" ADD CONSTRAINT "CardExpansions_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTechniques" ADD CONSTRAINT "CardTechniques_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardMagics" ADD CONSTRAINT "CardMagics_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE CASCADE ON UPDATE CASCADE;
