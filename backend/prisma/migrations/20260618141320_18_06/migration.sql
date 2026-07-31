-- CreateEnum
CREATE TYPE "Attributes" AS ENUM ('ST', 'DX', 'IQ', 'HT', 'PV', 'PER', 'PF');

-- CreateEnum
CREATE TYPE "ComparisonOperators" AS ENUM ('GT', 'GTE', 'LT', 'LTE', 'EQ');

-- CreateEnum
CREATE TYPE "MathOperators" AS ENUM ('ADD', 'SUB', 'MUL', 'DIV');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(100) NOT NULL,
    "email" VARCHAR(100) NOT NULL,
    "password" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "name" VARCHAR(100) NOT NULL,
    "image" TEXT,
    "gender" VARCHAR(50),
    "height" DOUBLE PRECISION,
    "age" INTEGER,
    "raceId" INTEGER,
    "strength" INTEGER NOT NULL,
    "life" INTEGER NOT NULL,
    "dexterity" INTEGER NOT NULL,
    "intelligence" INTEGER NOT NULL,
    "perception" INTEGER NOT NULL,
    "willing" INTEGER NOT NULL,
    "history" TEXT,
    "alignment" VARCHAR(50),
    "ratingAverage" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Traits" (
    "id" VARCHAR(50) NOT NULL,
    "isAdvantage" BOOLEAN NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(100),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Traits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Limitations" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(255),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Limitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expertises" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "attributeModify" VARCHAR(50),
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(255),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Expertises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Expansions" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(255),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Expansions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Techniques" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "attributeModify" VARCHAR(50),
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(255),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Techniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Magics" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "attributeModify" VARCHAR(50),
    "timeDuration" VARCHAR(100),
    "timeOperating" VARCHAR(100),
    "baseCost" INTEGER NOT NULL,
    "costIsVariable" BOOLEAN NOT NULL,
    "variableCost" INTEGER,
    "display" VARCHAR(100),
    "isAllowedLevel" BOOLEAN NOT NULL,
    "maxLevel" INTEGER,
    "shortDescription" VARCHAR(255),
    "fullDescription" TEXT,
    "formula" VARCHAR(100),
    "formulaDescription" TEXT,

    CONSTRAINT "Magics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Classes" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Classes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Types" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Difficulties" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(50) NOT NULL,

    CONSTRAINT "Difficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Races" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "Races_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ratings" (
    "id" SERIAL NOT NULL,
    "userId" TEXT NOT NULL,
    "cardId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "commentary" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Ratings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitRequirement" (
    "id" SERIAL NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "attribute" "Attributes" NOT NULL,
    "operator" "ComparisonOperators" NOT NULL,
    "value" INTEGER NOT NULL,
    "display" VARCHAR(100),

    CONSTRAINT "TraitRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitRestriction" (
    "id" SERIAL NOT NULL,
    "traitId" TEXT NOT NULL,
    "restrictedId" TEXT NOT NULL,
    "display" VARCHAR(100),

    CONSTRAINT "TraitRestriction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitModifier" (
    "id" SERIAL NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "attribute" "Attributes" NOT NULL,
    "operator" "MathOperators" NOT NULL,
    "value" INTEGER NOT NULL,
    "display" VARCHAR(100) NOT NULL,

    CONSTRAINT "TraitModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitEffect" (
    "id" SERIAL NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display" VARCHAR(100) NOT NULL,
    "effectType" VARCHAR(50) NOT NULL,

    CONSTRAINT "TraitEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitRules" (
    "id" SERIAL NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255) NOT NULL,

    CONSTRAINT "TraitRules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RaceModifier" (
    "id" SERIAL NOT NULL,
    "raceId" INTEGER NOT NULL,
    "attribute" VARCHAR(50) NOT NULL,
    "operator" "MathOperators" NOT NULL,
    "value" INTEGER NOT NULL,
    "display" VARCHAR(100),

    CONSTRAINT "RaceModifier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertiseRequirement" (
    "id" SERIAL NOT NULL,
    "expertiseId" VARCHAR(50) NOT NULL,
    "attribute" "Attributes" NOT NULL,
    "operator" "ComparisonOperators" NOT NULL,
    "value" INTEGER NOT NULL,
    "display" VARCHAR(100),

    CONSTRAINT "ExpertiseRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicRequirement" (
    "id" SERIAL NOT NULL,
    "magicId" VARCHAR(50) NOT NULL,
    "attribute" "Attributes" NOT NULL,
    "operator" "ComparisonOperators" NOT NULL,
    "value" INTEGER NOT NULL,
    "display" VARCHAR(100),

    CONSTRAINT "MagicRequirement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicEffect" (
    "id" SERIAL NOT NULL,
    "magicId" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "display" VARCHAR(100) NOT NULL,
    "effectType" VARCHAR(50) NOT NULL,

    CONSTRAINT "MagicEffect_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TraitType" (
    "id" SERIAL NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "TraitType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardTraits" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "traitId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardTraits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardLimitations" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "limitationId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardLimitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitationsTypes" (
    "id" SERIAL NOT NULL,
    "limitationId" VARCHAR(50) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "LimitationsTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardExpertises" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "expertiseId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardExpertises_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpertisesDifficulties" (
    "id" SERIAL NOT NULL,
    "expertiseId" VARCHAR(50) NOT NULL,
    "difficultyId" INTEGER NOT NULL,

    CONSTRAINT "ExpertisesDifficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardExpansions" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "expansionId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardExpansions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExpansionsTypes" (
    "id" SERIAL NOT NULL,
    "expansionId" VARCHAR(50) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "ExpansionsTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardTechniques" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "techniqueId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardTechniques_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechniquesDifficulties" (
    "id" SERIAL NOT NULL,
    "techniqueId" VARCHAR(50) NOT NULL,
    "difficultyId" INTEGER NOT NULL,

    CONSTRAINT "TechniquesDifficulties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardMagics" (
    "id" SERIAL NOT NULL,
    "cardId" VARCHAR(50) NOT NULL,
    "magicId" VARCHAR(50) NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 0,
    "currentCost" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CardMagics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicTypes" (
    "id" SERIAL NOT NULL,
    "magicId" VARCHAR(50) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "MagicTypes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MagicClass" (
    "id" SERIAL NOT NULL,
    "magicId" VARCHAR(50) NOT NULL,
    "classId" INTEGER NOT NULL,

    CONSTRAINT "MagicClass_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Card_userId_idx" ON "Card"("userId");

-- CreateIndex
CREATE INDEX "Card_raceId_idx" ON "Card"("raceId");

-- CreateIndex
CREATE INDEX "Card_createdAt_idx" ON "Card"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Classes_name_key" ON "Classes"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Types_name_key" ON "Types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Difficulties_name_key" ON "Difficulties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Races_name_key" ON "Races"("name");

-- CreateIndex
CREATE INDEX "Ratings_userId_idx" ON "Ratings"("userId");

-- CreateIndex
CREATE INDEX "Ratings_cardId_idx" ON "Ratings"("cardId");

-- CreateIndex
CREATE INDEX "Ratings_cardId_rating_idx" ON "Ratings"("cardId", "rating");

-- CreateIndex
CREATE UNIQUE INDEX "Ratings_userId_cardId_key" ON "Ratings"("userId", "cardId");

-- CreateIndex
CREATE INDEX "TraitRequirement_traitId_idx" ON "TraitRequirement"("traitId");

-- CreateIndex
CREATE INDEX "TraitRestriction_traitId_idx" ON "TraitRestriction"("traitId");

-- CreateIndex
CREATE INDEX "TraitRestriction_restrictedId_idx" ON "TraitRestriction"("restrictedId");

-- CreateIndex
CREATE UNIQUE INDEX "TraitRestriction_traitId_restrictedId_key" ON "TraitRestriction"("traitId", "restrictedId");

-- CreateIndex
CREATE INDEX "TraitModifier_traitId_idx" ON "TraitModifier"("traitId");

-- CreateIndex
CREATE INDEX "TraitEffect_traitId_idx" ON "TraitEffect"("traitId");

-- CreateIndex
CREATE INDEX "TraitEffect_effectType_idx" ON "TraitEffect"("effectType");

-- CreateIndex
CREATE INDEX "TraitRules_traitId_idx" ON "TraitRules"("traitId");

-- CreateIndex
CREATE INDEX "RaceModifier_raceId_idx" ON "RaceModifier"("raceId");

-- CreateIndex
CREATE INDEX "ExpertiseRequirement_expertiseId_idx" ON "ExpertiseRequirement"("expertiseId");

-- CreateIndex
CREATE INDEX "MagicRequirement_magicId_idx" ON "MagicRequirement"("magicId");

-- CreateIndex
CREATE INDEX "MagicEffect_magicId_idx" ON "MagicEffect"("magicId");

-- CreateIndex
CREATE INDEX "MagicEffect_effectType_idx" ON "MagicEffect"("effectType");

-- CreateIndex
CREATE INDEX "TraitType_traitId_idx" ON "TraitType"("traitId");

-- CreateIndex
CREATE UNIQUE INDEX "TraitType_traitId_typeId_key" ON "TraitType"("traitId", "typeId");

-- CreateIndex
CREATE INDEX "CardTraits_traitId_idx" ON "CardTraits"("traitId");

-- CreateIndex
CREATE UNIQUE INDEX "CardTraits_cardId_traitId_key" ON "CardTraits"("cardId", "traitId");

-- CreateIndex
CREATE INDEX "CardLimitations_limitationId_idx" ON "CardLimitations"("limitationId");

-- CreateIndex
CREATE UNIQUE INDEX "CardLimitations_cardId_limitationId_key" ON "CardLimitations"("cardId", "limitationId");

-- CreateIndex
CREATE INDEX "LimitationsTypes_limitationId_idx" ON "LimitationsTypes"("limitationId");

-- CreateIndex
CREATE UNIQUE INDEX "LimitationsTypes_limitationId_typeId_key" ON "LimitationsTypes"("limitationId", "typeId");

-- CreateIndex
CREATE INDEX "CardExpertises_expertiseId_idx" ON "CardExpertises"("expertiseId");

-- CreateIndex
CREATE UNIQUE INDEX "CardExpertises_cardId_expertiseId_key" ON "CardExpertises"("cardId", "expertiseId");

-- CreateIndex
CREATE INDEX "ExpertisesDifficulties_expertiseId_idx" ON "ExpertisesDifficulties"("expertiseId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpertisesDifficulties_expertiseId_difficultyId_key" ON "ExpertisesDifficulties"("expertiseId", "difficultyId");

-- CreateIndex
CREATE INDEX "CardExpansions_expansionId_idx" ON "CardExpansions"("expansionId");

-- CreateIndex
CREATE UNIQUE INDEX "CardExpansions_cardId_expansionId_key" ON "CardExpansions"("cardId", "expansionId");

-- CreateIndex
CREATE INDEX "ExpansionsTypes_expansionId_idx" ON "ExpansionsTypes"("expansionId");

-- CreateIndex
CREATE UNIQUE INDEX "ExpansionsTypes_expansionId_typeId_key" ON "ExpansionsTypes"("expansionId", "typeId");

-- CreateIndex
CREATE INDEX "CardTechniques_techniqueId_idx" ON "CardTechniques"("techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "CardTechniques_cardId_techniqueId_key" ON "CardTechniques"("cardId", "techniqueId");

-- CreateIndex
CREATE INDEX "TechniquesDifficulties_techniqueId_idx" ON "TechniquesDifficulties"("techniqueId");

-- CreateIndex
CREATE UNIQUE INDEX "TechniquesDifficulties_techniqueId_difficultyId_key" ON "TechniquesDifficulties"("techniqueId", "difficultyId");

-- CreateIndex
CREATE INDEX "CardMagics_magicId_idx" ON "CardMagics"("magicId");

-- CreateIndex
CREATE UNIQUE INDEX "CardMagics_cardId_magicId_key" ON "CardMagics"("cardId", "magicId");

-- CreateIndex
CREATE INDEX "MagicTypes_magicId_idx" ON "MagicTypes"("magicId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicTypes_magicId_typeId_key" ON "MagicTypes"("magicId", "typeId");

-- CreateIndex
CREATE INDEX "MagicClass_magicId_idx" ON "MagicClass"("magicId");

-- CreateIndex
CREATE UNIQUE INDEX "MagicClass_magicId_classId_key" ON "MagicClass"("magicId", "classId");

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Races"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ratings" ADD CONSTRAINT "Ratings_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitRequirement" ADD CONSTRAINT "TraitRequirement_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitRestriction" ADD CONSTRAINT "TraitRestriction_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitRestriction" ADD CONSTRAINT "TraitRestriction_restrictedId_fkey" FOREIGN KEY ("restrictedId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitModifier" ADD CONSTRAINT "TraitModifier_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitEffect" ADD CONSTRAINT "TraitEffect_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitRules" ADD CONSTRAINT "TraitRules_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceModifier" ADD CONSTRAINT "RaceModifier_raceId_fkey" FOREIGN KEY ("raceId") REFERENCES "Races"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertiseRequirement" ADD CONSTRAINT "ExpertiseRequirement_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicRequirement" ADD CONSTRAINT "MagicRequirement_magicId_fkey" FOREIGN KEY ("magicId") REFERENCES "Magics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicEffect" ADD CONSTRAINT "MagicEffect_magicId_fkey" FOREIGN KEY ("magicId") REFERENCES "Magics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitType" ADD CONSTRAINT "TraitType_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TraitType" ADD CONSTRAINT "TraitType_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTraits" ADD CONSTRAINT "CardTraits_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTraits" ADD CONSTRAINT "CardTraits_traitId_fkey" FOREIGN KEY ("traitId") REFERENCES "Traits"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardLimitations" ADD CONSTRAINT "CardLimitations_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardLimitations" ADD CONSTRAINT "CardLimitations_limitationId_fkey" FOREIGN KEY ("limitationId") REFERENCES "Limitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitationsTypes" ADD CONSTRAINT "LimitationsTypes_limitationId_fkey" FOREIGN KEY ("limitationId") REFERENCES "Limitations"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitationsTypes" ADD CONSTRAINT "LimitationsTypes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpertises" ADD CONSTRAINT "CardExpertises_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpertises" ADD CONSTRAINT "CardExpertises_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertisesDifficulties" ADD CONSTRAINT "ExpertisesDifficulties_expertiseId_fkey" FOREIGN KEY ("expertiseId") REFERENCES "Expertises"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpertisesDifficulties" ADD CONSTRAINT "ExpertisesDifficulties_difficultyId_fkey" FOREIGN KEY ("difficultyId") REFERENCES "Difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpansions" ADD CONSTRAINT "CardExpansions_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardExpansions" ADD CONSTRAINT "CardExpansions_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpansionsTypes" ADD CONSTRAINT "ExpansionsTypes_expansionId_fkey" FOREIGN KEY ("expansionId") REFERENCES "Expansions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExpansionsTypes" ADD CONSTRAINT "ExpansionsTypes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTechniques" ADD CONSTRAINT "CardTechniques_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardTechniques" ADD CONSTRAINT "CardTechniques_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Techniques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniquesDifficulties" ADD CONSTRAINT "TechniquesDifficulties_techniqueId_fkey" FOREIGN KEY ("techniqueId") REFERENCES "Techniques"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TechniquesDifficulties" ADD CONSTRAINT "TechniquesDifficulties_difficultyId_fkey" FOREIGN KEY ("difficultyId") REFERENCES "Difficulties"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardMagics" ADD CONSTRAINT "CardMagics_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CardMagics" ADD CONSTRAINT "CardMagics_magicId_fkey" FOREIGN KEY ("magicId") REFERENCES "Magics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicTypes" ADD CONSTRAINT "MagicTypes_magicId_fkey" FOREIGN KEY ("magicId") REFERENCES "Magics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicTypes" ADD CONSTRAINT "MagicTypes_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "Types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicClass" ADD CONSTRAINT "MagicClass_magicId_fkey" FOREIGN KEY ("magicId") REFERENCES "Magics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MagicClass" ADD CONSTRAINT "MagicClass_classId_fkey" FOREIGN KEY ("classId") REFERENCES "Classes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
