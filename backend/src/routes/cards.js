/*
╔════════════════════════════════════════════════╗
║                                                ║
║ ███████╗██╗ ██████╗██╗  ██╗ █████╗ ███████╗    ║
║ ██╔════╝██║██╔════╝██║  ██║██╔══██╗██╔════╝    ║
║ █████╗  ██║██║     ███████║███████║███████╗    ║
║ ██╔══╝  ██║██║     ██╔══██║██╔══██║╚════██║    ║
║ ██║     ██║╚██████╗██║  ██║██║  ██║███████║    ║
║ ╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ║
║                                                ║
╚════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Fichas (Cards).

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as fichas.
    - Buscar uma ficha por ID.

 ➤ Disponibiliza endpoints POST para:
    - Criar uma nova ficha.
 
 ➤ Disponibiliza endpoints PUT para:
    - Atualizar uma ficha através do seu ID.
 
 ➤ Disponibiliza endpoints DELETE para:
    - Excluir uma ficha através do seu ID.

 ➤ Algumas rotas utilizam autenticação através do authMiddleware para garantir que o usuário esteja autenticado.

 ➤ Para atualizar ou excluir uma ficha, o sistema verifica se o usuário é o proprietário da ficha ou possui permissões de administrador.

 ➤ Os dados são consultados na tabela Cards através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto cardInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/

import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "./auth.js";
import { buildCardSummarySelect } from "../utils/optimizedQueries.js";

const router = Router();

const cardInclude = {
  user: {
    select: {
      id: true,
      username: true,
      email: true,
    },
  },

  race: true,
  traits: { include: { trait: true } },
  limitations: { include: { limitation: true } },
  expertises: { include: { expertise: true } },
  expansions: { include: { expansion: true } },
  magics: { include: { magic: true } },
  techniques: { include: { technique: true } },
};

router.get("/summary", async (req, res) => {
  try {
    const cards = await prisma.card.findMany({
      select: buildCardSummarySelect(),
    });

    return res.json(cards);
  } catch (error) {
    console.error("Erro ao buscar fichas em modo resumo:", error);
    return res.status(500).json({ error: "Erro ao buscar fichas." });
  }
});

router.get("/", async (req, res) => {
  try {
    const cards = await prisma.card.findMany({ include: cardInclude });

    return res.json(cards);
  } catch (error) {
    console.error("Erro ao buscar fichas:", error);
    return res.status(500).json({ error: "Erro ao buscar fichas." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({
      where: { id },
      include: cardInclude,
    });

    if (!card) {
      return res.status(404).json({ error: "Ficha não encontrada." });
    }

    return res.json(card);
  } catch (error) {
    console.error("Erro ao buscar ficha:", error);
    return res.status(500).json({ error: "Erro ao buscar ficha." });
  }
});

router.get("/user/:userId/summary", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  try {
    const cards = await prisma.card.findMany({
      where: {
        userId,
      },
      select: buildCardSummarySelect(),
    });

    return res.json(cards);
  } catch (error) {
    console.error("Erro ao buscar fichas do usuário em modo resumo:", error);
    return res.status(500).json({ error: "Erro ao buscar fichas do usuário." });
  }
});

router.get("/user/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  if (!userId) {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  try {
    const cards = await prisma.card.findMany({
      where: {
        userId,
      },
      include: cardInclude,
    });

    return res.json(cards);
  } catch (error) {
    console.error("Erro ao buscar fichas do usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar fichas do usuário." });
  }
});

// POST /cards — cria uma nova ficha (requer autenticação)
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      image,
      gender,
      height,
      age,
      raceId,
      strength,
      life,
      dexterity,
      health,
      fatigue,
      intelligence,
      perception,
      willing,
      history,
      alignment,
      advantages,
      disadvantages,
      limitations,
      expansions,
      expertises,
      techniques,
      magics,
    } = req.body;

    // Validação dos campos obrigatórios
    if (
      !name ||
      strength == null ||
      life == null ||
      dexterity == null ||
      health == null ||
      fatigue == null ||
      intelligence == null ||
      perception == null ||
      willing == null
    ) {
      return res.status(400).json({
        error: "Preencha todos os campos obrigatórios.",
        missing: {
          name,
          strength,
          life,
          dexterity,
          health,
          fatigue,
          intelligence,
          perception,
          willing,
        },
      });
    }

    // Cria a ficha com todas as relações
    const card = await prisma.card.create({
      data: {
        userId: req.user.id,
        name,
        image: image || null,
        gender: gender || null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
        raceId: raceId ? parseInt(raceId) : null,
        strength: parseInt(strength),
        life: parseInt(life),
        dexterity: parseInt(dexterity),
        health: parseInt(health),
        fatigue: parseInt(fatigue),
        intelligence: parseInt(intelligence),
        perception: parseInt(perception),
        willing: parseInt(willing),
        history: history || null,
        alignment: alignment || null,

        traits: {
          create: [
            // Vantagens
            ...(advantages?.map((a) => ({
              traitId: a.id,
              level: a.level || 1,
              currentCost: 0,
            })) || []),
            // Desvantagens
            ...(disadvantages?.map((d) => ({
              traitId: d.id,
              level: d.level || 1,
              currentCost: 0,
            })) || []),
          ],
        },

        limitations: {
          create:
            limitations?.map((l) => ({
              limitationId: l.id,
              level: l.level || 1,
              currentCost: 0,
            })) || [],
        },

        expertises: {
          create:
            expertises?.map((e) => ({
              expertiseId: e.id,
              level: e.level || 1,
              currentCost: 0,
            })) || [],
        },

        expansions: {
          create:
            expansions?.map((e) => ({
              expansionId: e.id,
              level: e.level || 1,
              currentCost: 0,
            })) || [],
        },

        techniques: {
          create:
            techniques?.map((t) => ({
              techniqueId: t.id,
              level: t.level || 1,
              currentCost: 0,
            })) || [],
        },

        magics: {
          create:
            magics?.map((m) => ({
              magicId: m.id,
              level: m.level || 1,
              currentCost: 0,
            })) || [],
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        race: true,
        traits: {
          include: {
            trait: true,
          },
        },
        limitations: {
          include: {
            limitation: true,
          },
        },
        expertises: {
          include: {
            expertise: true,
          },
        },
        expansions: {
          include: {
            expansion: true,
          },
        },
        techniques: {
          include: {
            technique: true,
          },
        },
        magics: {
          include: {
            magic: true,
          },
        },
      },
    });

    return res.status(201).json(card);
  } catch (error) {
    // Log detalhado do erro do Prisma
    if (error.meta) {
      console.error(error.meta);
    }

    if (error.code === "P2003") {
      return res.status(400).json({
        error:
          "Erro de relação: Um dos IDs fornecidos não existe no banco de dados.",
        details: error.meta?.field_name || "Verifique os IDs enviados",
      });
    }

    if (error.code === "P2002") {
      return res.status(400).json({
        error: "Erro de unicidade: Este registro já existe.",
        details: error.meta?.target || "Verifique os dados enviados",
      });
    }

    return res.status(500).json({
      error: "Erro ao criar ficha.",
      details: error.message,
      code: error.code || "UNKNOWN",
    });
  }
});

router.put("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({ where: { id } });

    if (!card) {
      return res.status(404).json({ error: "Ficha não encontrada." });
    }

    if (card.userId !== req.user.id && !req.user.admin) {
      return res
        .status(403)
        .json({ error: "Sem permissão para editar esta ficha." });
    }

    const {
      name,
      image,
      gender,
      height,
      age,
      raceId,
      strength,
      life,
      dexterity,
      health,
      fatigue,
      intelligence,
      perception,
      willing,
      history,
      alignment,
      advantages,
      disadvantages,
      limitations,
      expansions,
      expertises,
      techniques,
      magics,
    } = req.body;

    // Primeiro, remove todas as relações existentes
    await prisma.$transaction([
      prisma.cardTraits.deleteMany({ where: { cardId: id } }),
      prisma.cardLimitations.deleteMany({ where: { cardId: id } }),
      prisma.cardExpertises.deleteMany({ where: { cardId: id } }),
      prisma.cardExpansions.deleteMany({ where: { cardId: id } }),
      prisma.cardTechniques.deleteMany({ where: { cardId: id } }),
      prisma.cardMagics.deleteMany({ where: { cardId: id } }),
    ]);

    // Depois, atualiza com as novas relações
    const updated = await prisma.card.update({
      where: { id },
      data: {
        name,
        image: image || null,
        gender: gender || null,
        height: height ? parseFloat(height) : null,
        age: age ? parseInt(age) : null,
        raceId: raceId ? parseInt(raceId) : null,
        strength: parseInt(strength),
        life: parseInt(life),
        dexterity: parseInt(dexterity),
        health: parseInt(health),
        fatigue: parseInt(fatigue),
        intelligence: parseInt(intelligence),
        perception: parseInt(perception),
        willing: parseInt(willing),
        history: history || null,
        alignment: alignment || null,

        traits: {
          create: [
            // Vantagens
            ...(advantages?.map((a) => ({
              traitId: a.id,
              level: a.level || 1,
              currentCost: 0,
            })) || []),
            // Desvantagens
            ...(disadvantages?.map((d) => ({
              traitId: d.id,
              level: d.level || 1,
              currentCost: 0,
            })) || []),
          ],
        },

        limitations: {
          create:
            limitations?.map((l) => ({
              limitationId: l.id,
              level: l.level || 1,
              currentCost: 0,
            })) || [],
        },

        expertises: {
          create:
            expertises?.map((e) => ({
              expertiseId: e.id,
              level: e.level || 1,
              currentCost: 0,
            })) || [],
        },

        expansions: {
          create:
            expansions?.map((e) => ({
              expansionId: e.id,
              level: e.level || 1,
              currentCost: 0,
            })) || [],
        },

        techniques: {
          create:
            techniques?.map((t) => ({
              techniqueId: t.id,
              level: t.level || 1,
              currentCost: 0,
            })) || [],
        },

        magics: {
          create:
            magics?.map((m) => ({
              magicId: m.id,
              level: m.level || 1,
              currentCost: 0,
            })) || [],
        },
      },
      include: cardInclude,
    });

    return res.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar ficha:", error);
    return res.status(500).json({ error: "Erro ao atualizar ficha." });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;

  try {
    const card = await prisma.card.findUnique({ where: { id } });

    if (!card) {
      return res.status(404).json({ error: "Ficha não encontrada." });
    }

    if (card.userId !== req.user.id && !req.user.admin) {
      return res
        .status(403)
        .json({ error: "Sem permissão para deletar esta ficha." });
    }

    await prisma.card.delete({ where: { id } });

    return res.json({ message: "Ficha deletada com sucesso." });
  } catch (error) {
    console.error("Erro ao deletar ficha:", error);
    return res.status(500).json({ error: "Erro ao deletar ficha." });
  }
});

export { router as cardRoutes };