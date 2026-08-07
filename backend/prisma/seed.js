/*
╔═══════════════════════════════════════════════╗
║                                               ║
║   ███████╗███████╗███████╗██████╗             ║
║   ██╔════╝██╔════╝██╔════╝██╔══██╗            ║
║   ███████╗█████╗  █████╗  ██║  ██║            ║
║   ╚════██║██╔══╝  ██╔══╝  ██║  ██║            ║
║   ███████║███████╗███████╗██████╔╝            ║
║   ╚══════╝╚══════╝╚══════╝╚═════╝             ║
║                                               ║
╚═══════════════════════════════════════════════╝
*/

import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const prisma = new PrismaClient();
const __dirname = dirname(fileURLToPath(import.meta.url));
const data = (file) =>
  JSON.parse(readFileSync(join(__dirname, "seeds", file), "utf-8"));

// ─────────────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Iniciando seed...\n");

  try {
    await prisma.$executeRaw`DISCARD ALL;`;
    console.log("✅ Cache do PostgreSQL limpo");
  } catch (error) {
    console.log("⚠️ Não foi possível limpar o cache (pode ser ignorado)");
  }

  // ══════════════════════════════════════════════════════
  // 1. TIPOS
  // ══════════════════════════════════════════════════════
  console.log("📋 Inserindo tipos...");
  const typesJson = data("types.json");

  for (const type of typesJson) {
    await prisma.types.upsert({
      where: { name: type.name },
      update: type,
      create: type,
    });
  }

  const types = await prisma.types.findMany();
  const typeMap = new Map(types.map((t) => [t.name, t]));

  // ══════════════════════════════════════════════════════
  // 2. DIFICULDADES
  // ══════════════════════════════════════════════════════
  console.log("😡 Inserindo dificuldades...");
  const difficultiesJson = data("difficulties.json");

  for (const difficulty of difficultiesJson) {
    await prisma.difficulties.upsert({
      where: { name: difficulty.name },
      update: difficulty,
      create: difficulty,
    });
  }

  const difficulties = await prisma.difficulties.findMany();
  const difficultyMap = new Map(difficulties.map((d) => [d.name, d]));

  // ══════════════════════════════════════════════════════
  // 3. CLASSES
  // ══════════════════════════════════════════════════════
  console.log("🛡 Inserindo classes...");
  const classesJson = data("classes.json");

  for (const cls of classesJson) {
    await prisma.classes.upsert({
      where: { name: cls.name },
      update: cls,
      create: cls,
    });
  }

  const classes = await prisma.classes.findMany();
  const classMap = new Map(classes.map((c) => [c.name, c]));

  // ══════════════════════════════════════════════════════
  // 4. RAÇAS
  // ══════════════════════════════════════════════════════
  console.log("🧝‍ Inserindo raças...");
  const racesJson = data("races.json");

  for (const race of racesJson) {
    const { modifiers, ...raceData } = race;

    const created = await prisma.races.upsert({
      where: { name: raceData.name },
      update: raceData,
      create: raceData,
    });

    if (Array.isArray(modifiers) && modifiers.length > 0) {
      await prisma.raceModifier.deleteMany({ where: { raceId: created.id } });

      await prisma.raceModifier.createMany({
        data: modifiers.map((m) => ({ ...m, raceId: created.id })),
      });
    }
  }

  // ══════════════════════════════════════════════════════
  // 5. CARACTÉRISTICAS (Vantagens e Desvantagens)
  // ══════════════════════════════════════════════════════
  console.log("🪪 Inserindo características...");
  const traitsJson = data("traits.json");

  for (const trait of traitsJson) {
    const {
      types: traitTypes,
      requirements,
      restrictions,
      modifiers,
      effects,
      rules,
      ...traitData
    } = trait;

    // 🔧 Limpa e normaliza os dados
    const cleanTraitData = {
      id: traitData.id,
      isAdvantage: Boolean(traitData.isAdvantage),
      name: traitData.name,
      baseCost: Number(traitData.baseCost) || 0,
      costIsVariable: Boolean(traitData.costIsVariable),
      variableCost:
        traitData.variableCost !== null && traitData.variableCost !== undefined
          ? Number(traitData.variableCost)
          : null,
      display: traitData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(traitData.isAllowedLevel),
      maxLevel:
        traitData.maxLevel !== null && traitData.maxLevel !== undefined
          ? Number(traitData.maxLevel)
          : null,
      shortDescription: traitData.shortDescription?.substring(0, 255) || null,
      fullDescription: traitData.fullDescription || null,
      formula: traitData.formula?.substring(0, 100) || "N/A",
      formulaDescription: traitData.formulaDescription || "Sem descrição",
    };

    try {
      await prisma.traits.upsert({
        where: { id: cleanTraitData.id },
        update: cleanTraitData,
        create: cleanTraitData,
      });
    } catch (error) {
      console.error(`❌ Erro no trait ${cleanTraitData.id}:`, error.message);
      console.error("  Dados:", cleanTraitData);
      throw error;
    }

    // Limpa relacionamentos existentes
    await prisma.traitType.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitRequirement.deleteMany({
      where: { traitId: traitData.id },
    });
    await prisma.traitModifier.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitEffect.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitRules.deleteMany({ where: { traitId: traitData.id } });

    // ── Types ──
    if (Array.isArray(traitTypes) && traitTypes.length > 0) {
      for (const typeName of traitTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (trait: ${traitData.id})`,
          );
          continue;
        }
        await prisma.traitType.create({
          data: { traitId: traitData.id, typeId: type.id },
        });
      }
    }

    // ── Requirements ──
    if (Array.isArray(requirements) && requirements.length > 0) {
      for (const requirement of requirements) {
        await prisma.traitRequirement.create({
          data: {
            traitId: traitData.id,
            attribute: requirement.attribute,
            operator: requirement.operator,
            value: Number(requirement.value),
            display: requirement.display?.substring(0, 100) || null,
          },
        });
      }
    }

    // ── Modifiers ──
    if (Array.isArray(modifiers) && modifiers.length > 0) {
      for (const modifier of modifiers) {
        await prisma.traitModifier.create({
          data: {
            traitId: traitData.id,
            attribute: modifier.attribute,
            operator: modifier.operator,
            value: Number(modifier.value),
            display: modifier.display?.substring(0, 100) || "",
          },
        });
      }
    }

    // ── Effects ──
    if (Array.isArray(effects) && effects.length > 0) {
      for (const effect of effects) {
        await prisma.traitEffect.create({
          data: {
            traitId: traitData.id,
            name: effect.name?.substring(0, 100) || "Efeito",
            effectType: effect.effectType?.substring(0, 50) || "unknown",
            display: effect.display?.substring(0, 100) || effect.name || "",
          },
        });
      }
    }

    // ── Rules ──
    if (Array.isArray(rules) && rules.length > 0) {
      for (const rule of rules) {
        await prisma.traitRules.create({
          data: {
            traitId: traitData.id,
            name: rule.name?.substring(0, 100) || "Regra",
            description: rule.description || null,
          },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 5.1 RESTRIÇÕES (processadas depois)
  // ══════════════════════════════════════════════════════
  console.log("🔐 Inserindo restrições das características...");
  const traitIds = new Set(traitsJson.map((trait) => trait.id));

  for (const trait of traitsJson) {
    if (!Array.isArray(trait.restrictions) || trait.restrictions.length === 0)
      continue;

    await prisma.traitRestriction.deleteMany({
      where: { traitId: trait.id },
    });

    for (const restriction of trait.restrictions) {
      if (!traitIds.has(restriction.restrictedId)) {
        console.warn(
          `  ⚠️  Restriction ignorada — trait alvo não existe: "${restriction.restrictedId}" (trait: ${trait.id})`,
        );
        continue;
      }
      await prisma.traitRestriction.create({
        data: {
          traitId: trait.id,
          restrictedId: restriction.restrictedId,
          display: restriction.display?.substring(0, 100) || null,
        },
      });
    }
  }

  // ══════════════════════════════════════════════════════
  // 6. LIMITAÇÕES
  // ══════════════════════════════════════════════════════
  console.log("🔒 Inserindo limitações...");
  const limitationsJson = data("limitations.json");

  for (const limitation of limitationsJson) {
    const { types: limitationTypes, ...limitationData } = limitation;

    const cleanLimitationData = {
      id: limitationData.id,
      name: limitationData.name,
      baseCost: Number(limitationData.baseCost) || 0,
      costIsVariable: Boolean(limitationData.costIsVariable),
      variableCost:
        limitationData.variableCost !== null &&
        limitationData.variableCost !== undefined
          ? Number(limitationData.variableCost)
          : null,
      display: limitationData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(limitationData.isAllowedLevel),
      maxLevel:
        limitationData.maxLevel !== null && limitationData.maxLevel !== undefined
          ? Number(limitationData.maxLevel)
          : null,
      shortDescription: limitationData.shortDescription?.substring(0, 255) ||
        null,
      fullDescription: limitationData.fullDescription || null,
      formula: limitationData.formula?.substring(0, 100) || "N/A",
      formulaDescription: limitationData.formulaDescription ||
        "Sem descrição",
    };

    await prisma.limitations.upsert({
      where: { id: cleanLimitationData.id },
      update: cleanLimitationData,
      create: cleanLimitationData,
    });

    await prisma.limitationsTypes.deleteMany({
      where: { limitationId: limitationData.id },
    });

    if (Array.isArray(limitationTypes) && limitationTypes.length > 0) {
      for (const typeName of limitationTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (limitation: ${limitationData.id})`,
          );
          continue;
        }
        await prisma.limitationsTypes.create({
          data: { limitationId: limitationData.id, typeId: type.id },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 7. PERÍCIAS
  // ══════════════════════════════════════════════════════
  console.log("🧪 Inserindo perícias...");
  const expertisesJson = data("expertises.json");

  for (const expertise of expertisesJson) {
    const { difficulties: expertiseDiffs, requirements, ...expertiseData } =
      expertise;

    const cleanExpertiseData = {
      id: expertiseData.id,
      name: expertiseData.name,
      attributeModify: expertiseData.attributeModify?.substring(0, 50) || null,
      baseCost: Number(expertiseData.baseCost) || 0,
      costIsVariable: Boolean(expertiseData.costIsVariable),
      variableCost:
        expertiseData.variableCost !== null &&
        expertiseData.variableCost !== undefined
          ? Number(expertiseData.variableCost)
          : null,
      display: expertiseData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(expertiseData.isAllowedLevel),
      maxLevel:
        expertiseData.maxLevel !== null && expertiseData.maxLevel !== undefined
          ? Number(expertiseData.maxLevel)
          : null,
      shortDescription: expertiseData.shortDescription?.substring(0, 255) ||
        null,
      fullDescription: expertiseData.fullDescription || null,
      formula: expertiseData.formula?.substring(0, 100) || "N/A",
      formulaDescription: expertiseData.formulaDescription ||
        "Sem descrição",
    };

    await prisma.expertises.upsert({
      where: { id: cleanExpertiseData.id },
      update: cleanExpertiseData,
      create: cleanExpertiseData,
    });

    await prisma.expertisesDifficulties.deleteMany({
      where: { expertiseId: expertiseData.id },
    });
    await prisma.expertiseRequirement.deleteMany({
      where: { expertiseId: expertiseData.id },
    });

    if (Array.isArray(expertiseDiffs) && expertiseDiffs.length > 0) {
      for (const difficultyName of expertiseDiffs) {
        const difficulty = difficultyMap.get(difficultyName);
        if (!difficulty) {
          console.warn(
            `  ⚠️  Dificuldade não encontrada: "${difficultyName}" (expertise: ${expertiseData.id})`,
          );
          continue;
        }
        await prisma.expertisesDifficulties.create({
          data: {
            expertiseId: expertiseData.id,
            difficultyId: difficulty.id,
          },
        });
      }
    }

    if (Array.isArray(requirements) && requirements.length > 0) {
      for (const requirement of requirements) {
        await prisma.expertiseRequirement.create({
          data: {
            expertiseId: expertiseData.id,
            attribute: requirement.attribute,
            operator: requirement.operator,
            value: Number(requirement.value),
            display: requirement.display?.substring(0, 100) || null,
          },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 8. AMPLIAÇÕES
  // ══════════════════════════════════════════════════════
  console.log("🔍 Inserindo ampliações...");
  const expansionsJson = data("expansions.json");

  for (const expansion of expansionsJson) {
    const { types: expansionTypes, ...expansionData } = expansion;

    const cleanExpansionData = {
      id: expansionData.id,
      name: expansionData.name,
      baseCost: Number(expansionData.baseCost) || 0,
      costIsVariable: Boolean(expansionData.costIsVariable),
      variableCost:
        expansionData.variableCost !== null &&
        expansionData.variableCost !== undefined
          ? Number(expansionData.variableCost)
          : null,
      display: expansionData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(expansionData.isAllowedLevel),
      maxLevel:
        expansionData.maxLevel !== null && expansionData.maxLevel !== undefined
          ? Number(expansionData.maxLevel)
          : null,
      shortDescription: expansionData.shortDescription?.substring(0, 255) ||
        null,
      fullDescription: expansionData.fullDescription || null,
      formula: expansionData.formula?.substring(0, 100) || "N/A",
      formulaDescription: expansionData.formulaDescription ||
        "Sem descrição",
    };

    await prisma.expansions.upsert({
      where: { id: cleanExpansionData.id },
      update: cleanExpansionData,
      create: cleanExpansionData,
    });

    await prisma.expansionsTypes.deleteMany({
      where: { expansionId: expansionData.id },
    });

    if (Array.isArray(expansionTypes) && expansionTypes.length > 0) {
      for (const typeName of expansionTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (expansion: ${expansionData.id})`,
          );
          continue;
        }
        await prisma.expansionsTypes.create({
          data: { expansionId: expansionData.id, typeId: type.id },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 9. TÉCNICAS
  // ══════════════════════════════════════════════════════
  console.log("🥋 Inserindo técnicas...");
  const techniquesJson = data("techniques.json");

  for (const technique of techniquesJson) {
    const { difficulties: techniqueDiffs, ...techniqueData } = technique;

    const cleanTechniqueData = {
      id: techniqueData.id,
      name: techniqueData.name,
      attributeModify: techniqueData.attributeModify?.substring(0, 50) || null,
      baseCost: Number(techniqueData.baseCost) || 0,
      costIsVariable: Boolean(techniqueData.costIsVariable),
      variableCost:
        techniqueData.variableCost !== null &&
        techniqueData.variableCost !== undefined
          ? Number(techniqueData.variableCost)
          : null,
      display: techniqueData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(techniqueData.isAllowedLevel),
      maxLevel:
        techniqueData.maxLevel !== null && techniqueData.maxLevel !== undefined
          ? Number(techniqueData.maxLevel)
          : null,
      shortDescription: techniqueData.shortDescription?.substring(0, 255) ||
        null,
      fullDescription: techniqueData.fullDescription || null,
      formula: techniqueData.formula?.substring(0, 100) || "N/A",
      formulaDescription: techniqueData.formulaDescription ||
        "Sem descrição",
    };

    await prisma.techniques.upsert({
      where: { id: cleanTechniqueData.id },
      update: cleanTechniqueData,
      create: cleanTechniqueData,
    });

    await prisma.techniquesDifficulties.deleteMany({
      where: { techniqueId: techniqueData.id },
    });

    if (Array.isArray(techniqueDiffs) && techniqueDiffs.length > 0) {
      for (const difficultyName of techniqueDiffs) {
        const difficulty = difficultyMap.get(difficultyName);
        if (!difficulty) {
          console.warn(
            `  ⚠️  Dificuldade não encontrada: "${difficultyName}" (technique: ${techniqueData.id})`,
          );
          continue;
        }
        await prisma.techniquesDifficulties.create({
          data: {
            techniqueId: techniqueData.id,
            difficultyId: difficulty.id,
          },
        });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 10. MAGIAS
  // ══════════════════════════════════════════════════════
  console.log("🪄 Inserindo magias...");
  const magicsJson = data("magics.json");

  for (const magic of magicsJson) {
    const { types: magicTypes, classes: magicClasses, requirements, effects, ...magicData } =
      magic;

    const cleanMagicData = {
      id: magicData.id,
      name: magicData.name,
      attributeModify: magicData.attributeModify?.substring(0, 50) || null,
      timeDuration: magicData.timeDuration?.substring(0, 100) || null,
      timeOperating: magicData.timeOperating?.substring(0, 100) || null,
      baseCost: Number(magicData.baseCost) || 0,
      costIsVariable: Boolean(magicData.costIsVariable),
      variableCost:
        magicData.variableCost !== null && magicData.variableCost !== undefined
          ? Number(magicData.variableCost)
          : null,
      display: magicData.display?.substring(0, 100) || null,
      isAllowedLevel: Boolean(magicData.isAllowedLevel),
      maxLevel:
        magicData.maxLevel !== null && magicData.maxLevel !== undefined
          ? Number(magicData.maxLevel)
          : null,
      shortDescription: magicData.shortDescription?.substring(0, 255) || null,
      fullDescription: magicData.fullDescription || null,
      formula: magicData.formula?.substring(0, 100) || "N/A",
      formulaDescription: magicData.formulaDescription || "Sem descrição",
    };

    await prisma.magics.upsert({
      where: { id: cleanMagicData.id },
      update: cleanMagicData,
      create: cleanMagicData,
    });

    await prisma.magicTypes.deleteMany({ where: { magicId: magicData.id } });
    await prisma.magicClass.deleteMany({ where: { magicId: magicData.id } });
    await prisma.magicRequirement.deleteMany({
      where: { magicId: magicData.id },
    });
    await prisma.magicEffect.deleteMany({ where: { magicId: magicData.id } });

    if (Array.isArray(magicTypes) && magicTypes.length > 0) {
      for (const typeName of magicTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (magic: ${magicData.id})`,
          );
          continue;
        }
        await prisma.magicTypes.create({
          data: { magicId: magicData.id, typeId: type.id },
        });
      }
    }

    if (Array.isArray(magicClasses) && magicClasses.length > 0) {
      for (const className of magicClasses) {
        const cls = classMap.get(className);
        if (!cls) {
          console.warn(
            `  ⚠️  Classe não encontrada: "${className}" (magic: ${magicData.id})`,
          );
          continue;
        }
        await prisma.magicClass.create({
          data: { magicId: magicData.id, classId: cls.id },
        });
      }
    }

    if (Array.isArray(requirements) && requirements.length > 0) {
      for (const requirement of requirements) {
        await prisma.magicRequirement.create({
          data: {
            magicId: magicData.id,
            attribute: requirement.attribute,
            operator: requirement.operator,
            value: Number(requirement.value),
            display: requirement.display?.substring(0, 100) || null,
          },
        });
      }
    }

    if (Array.isArray(effects) && effects.length > 0) {
      for (const effect of effects) {
        await prisma.magicEffect.create({
          data: {
            magicId: magicData.id,
            name: effect.name?.substring(0, 100) || "Efeito",
            effectType: effect.effectType?.substring(0, 50) || "unknown",
            display: effect.display?.substring(0, 100) || effect.name || "",
          },
        });
      }
    }
  }

  console.log("\n🌳 Seed finalizado com sucesso!");
}

// ─────────────────────────────────────────────────────────────────────────────

main()
  .catch((e) => {
    console.error("🔥 Erro no seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });