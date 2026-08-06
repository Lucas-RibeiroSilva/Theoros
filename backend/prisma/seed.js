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

  ➤ Seed.js é responsável por popular o banco de dados com os dados definidos nos arquivos JSON da pasta /seeds.

  ➤ Os arquivos JSON são carregados a partir da pasta /seeds utilizando o caminho resolvido por __dirname.

  ➤ O Prisma insere registros utilizando createMany() e evita duplicações com skipDuplicates.

  ➤ Os objetos Map são utilizados para localizar registros já carregados de forma rápida durante a criação dos relacionamentos.

  ➤ upsert() atualiza um registro existente ou cria um novo caso ele ainda não exista.

  ➤ O operador rest (...) separa os dados principais do registro dos dados utilizados em relacionamentos, (types, requirements, modifiers, etc.), permitindo que cada relação seja processada individualmente.

  ➤ Caso uma referência não seja encontrada, o seed exibe um aviso e continua a execução para evitar interromper o processo completo.

  ➤ main() executa toda a rotina de seed.js. Ao final da execução, a conexão com o banco é encerrada através de prisma.$disconnect().
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

  // ══════════════════════════════════════════════════════
  // 1. TIPOS
  // ══════════════════════════════════════════════════════
  console.log("❔ Inserindo tipos...");
  const typesJson = data("types.json");

  await prisma.types.createMany({ data: typesJson, skipDuplicates: true });

  const types = await prisma.types.findMany();
  const typeMap = new Map(types.map((t) => [t.name, t]));

  // ══════════════════════════════════════════════════════
  // 2. DIFICULDADES
  // ══════════════════════════════════════════════════════
  console.log("😡 Inserindo dificuldades...");
  const difficultiesJson = data("difficulties.json");

  await prisma.difficulties.createMany({ data: difficultiesJson, skipDuplicates: true });

  const difficulties = await prisma.difficulties.findMany();
  const difficultyMap = new Map(difficulties.map((d) => [d.name, d]));

  // ══════════════════════════════════════════════════════
  // 3. CLASSES
  // ══════════════════════════════════════════════════════
  console.log("🛡 Inserindo classes...");
  const classesJson = data("classes.json");

  await prisma.classes.createMany({ data: classesJson, skipDuplicates: true });

  const classes = await prisma.classes.findMany();
  const classMap = new Map(classes.map((c) => [c.name, c]));

  // ══════════════════════════════════════════════════════
  // 4. RAÇAS
  // ══════════════════════════════════════════════════════
  console.log("🧝‍ Inserindo raças...");
  const racesJson = data("races.json");

  for (const race of racesJson) {
    const { modifiers, ...raceData } = race;

    const created = await prisma.races.upsert({ where: { name: raceData.name }, update: raceData, create: raceData });

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
    const { types: traitTypes, requirements, restrictions, modifiers, effects, rules, ...traitData } = trait;

    await prisma.traits.upsert({ where: { id: traitData.id }, update: traitData, create: traitData });

    await prisma.traitType.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitRequirement.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitModifier.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitEffect.deleteMany({ where: { traitId: traitData.id } });
    await prisma.traitRules.deleteMany({ where: { traitId: traitData.id } });

    if (Array.isArray(traitTypes)) {
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

    if (Array.isArray(requirements)) {
      for (const requirement of requirements) {
        await prisma.traitRequirement.create({
          data: { traitId: traitData.id, ...requirement },
        });
      }
    }

    if (Array.isArray(modifiers)) {
      for (const modifier of modifiers) {
        await prisma.traitModifier.create({
          data: { traitId: traitData.id, ...modifier },
        });
      }
    }

    if (Array.isArray(effects)) {
      for (const effect of effects) {
        await prisma.traitEffect.create({
          data: { traitId: traitData.id, ...effect },
        });
      }
    }

    if (Array.isArray(rules)) {
      for (const rule of rules) {
        await prisma.traitRules.create({
          data: { traitId: traitData.id, ...rule },
        });
      }
    }
  }

  // As restrições são processadas após a criação de todas as características.
  // Isso garante que a característica alvo já exista antes da criação do relacionamento.
  console.log("🔐 Inserindo restrições das características...");
  const traitIds = new Set(traitsJson.map((trait) => trait.id));

  for (const trait of traitsJson) {
    if (!Array.isArray(trait.restrictions) || trait.restrictions.length === 0)
      continue;

    await prisma.traitRestriction.deleteMany({ where: { traitId: trait.id } });

    for (const restriction of trait.restrictions) {
      if (!traitIds.has(restriction.restrictedId)) {
        console.warn(
          `  ⚠️  Restriction ignorada — trait alvo não existe: "${restriction.restrictedId}" (trait: ${trait.id})`,
        );
        continue;
      }
      await prisma.traitRestriction.create({ data: { traitId: trait.id, restrictedId: restriction.restrictedId, display: restriction.display }});
    }
  }

  // ══════════════════════════════════════════════════════
  // 6. LIMITAÇÕES
  // ══════════════════════════════════════════════════════
  console.log("🔒 Inserindo limitações...");
  const limitationsJson = data("limitations.json");

  for (const limitation of limitationsJson) {
    const { types: limitationTypes, ...limitationData } = limitation;

    await prisma.limitations.upsert({ where: { id: limitationData.id }, update: limitationData, create: limitationData });

    await prisma.limitationsTypes.deleteMany({
      where: { limitationId: limitationData.id },
    });

    if (Array.isArray(limitationTypes)) {
      for (const typeName of limitationTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (limitation: ${limitationData.id})`,
          );
          continue;
        }
        await prisma.limitationsTypes.create({ data: { limitationId: limitationData.id, typeId: type.id } });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 7. PÉRICIAS
  // ══════════════════════════════════════════════════════
  console.log("🧪 Inserindo perícias...");
  const expertisesJson = data("expertises.json");

  for (const expertise of expertisesJson) {
    const { difficulties: expertiseDiffs, requirements, ...expertiseData } = expertise;

    await prisma.expertises.upsert({ where: { id: expertiseData.id }, update: expertiseData, create: expertiseData });

    await prisma.expertisesDifficulties.deleteMany({ where: { expertiseId: expertiseData.id } });
    await prisma.expertiseRequirement.deleteMany({ where: { expertiseId: expertiseData.id } });

    if (Array.isArray(expertiseDiffs)) {
      for (const difficultyName of expertiseDiffs) {
        const difficulty = difficultyMap.get(difficultyName);
        if (!difficulty) {
          console.warn(
            `  ⚠️  Dificuldade não encontrada: "${difficultyName}" (expertise: ${expertiseData.id})`,
          );
          continue;
        }
        await prisma.expertisesDifficulties.create({ data: { expertiseId: expertiseData.id, difficultyId: difficulty.id } });
      }
    }

    if (Array.isArray(requirements)) {
      for (const requirement of requirements) {
        await prisma.expertiseRequirement.create({
          data: { expertiseId: expertiseData.id, ...requirement },
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

    await prisma.expansions.upsert({ where: { id: expansionData.id }, update: expansionData, create: expansionData });

    await prisma.expansionsTypes.deleteMany({
      where: { expansionId: expansionData.id },
    });

    if (Array.isArray(expansionTypes)) {
      for (const typeName of expansionTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `  ⚠️  Tipo não encontrado: "${typeName}" (expansion: ${expansionData.id})`,
          );
          continue;
        }
        await prisma.expansionsTypes.create({ data: { expansionId: expansionData.id, typeId: type.id } });
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

    await prisma.techniques.upsert({ where: { id: techniqueData.id }, update: techniqueData, create: techniqueData });

    await prisma.techniquesDifficulties.deleteMany({ where: { techniqueId: techniqueData.id } });

    if (Array.isArray(techniqueDiffs)) {
      for (const difficultyName of techniqueDiffs) {
        const difficulty = difficultyMap.get(difficultyName);
        if (!difficulty) {
          console.warn(
            `  ⚠️  Dificuldade não encontrada: "${difficultyName}" (technique: ${techniqueData.id})`,
          );
          continue;
        }
        await prisma.techniquesDifficulties.create({ data: { techniqueId: techniqueData.id, difficultyId: difficulty.id } });
      }
    }
  }

  // ══════════════════════════════════════════════════════
  // 10. MÁGIAS
  // ══════════════════════════════════════════════════════
  console.log("🪄 Inserindo magias...");
  const magicsJson = data("magics.json");

  for (const magic of magicsJson) {
    const { types: magicTypes, classes: magicClasses, requirements, effects, ...magicData } = magic;

    await prisma.magics.upsert({ where: { id: magicData.id }, update: magicData, create: magicData });

    await prisma.magicTypes.deleteMany({ where: { magicId: magicData.id } });
    await prisma.magicClass.deleteMany({ where: { magicId: magicData.id } });
    await prisma.magicRequirement.deleteMany({ where: { magicId: magicData.id } });
    await prisma.magicEffect.deleteMany({ where: { magicId: magicData.id } });

    if (Array.isArray(magicTypes)) {
      for (const typeName of magicTypes) {
        const type = typeMap.get(typeName);
        if (!type) {
          console.warn(
            `⚠️  Tipo não encontrado: "${typeName}" (magic: ${magicData.id})`,
          );
          continue;
        }
        await prisma.magicTypes.create({
          data: { magicId: magicData.id, typeId: type.id },
        });
      }
    }

    if (Array.isArray(magicClasses)) {
      for (const className of magicClasses) {
        const clas = classMap.get(className);
        if (!clas) {
          console.warn(
            `⚠️  Classe não encontrada: "${className}" (magic: ${magicData.id})`,
          );
          continue;
        }
        await prisma.magicClass.create({
          data: { magicId: magicData.id, classId: clas.id },
        });
      }
    }

    if (Array.isArray(requirements)) {
      for (const requirement of requirements) {
        await prisma.magicRequirement.create({
          data: { magicId: magicData.id, ...requirement },
        });
      }
    }

    if (Array.isArray(effects)) {
      for (const effect of effects) {
        await prisma.magicEffect.create({
          data: { magicId: magicData.id, ...effect },
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