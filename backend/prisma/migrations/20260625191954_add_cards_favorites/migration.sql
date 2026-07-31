-- CreateTable
CREATE TABLE "CardsFavorites" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,

    CONSTRAINT "CardsFavorites_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CardsFavorites_cardId_idx" ON "CardsFavorites"("cardId");

-- AddForeignKey
ALTER TABLE "CardsFavorites" ADD CONSTRAINT "CardsFavorites_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardsFavorites" ADD CONSTRAINT "CardsFavorites_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
