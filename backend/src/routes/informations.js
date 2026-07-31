/*
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                              ║
║ ██╗███╗   ██╗███████╗ ██████╗ ██████╗ ███╗   ███╗ █████╗  ██████╗ ██████╗ ███████╗███████╗   ║
║ ██║████╗  ██║██╔════╝██╔═══██╗██╔══██╗████╗ ████║██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔════╝   ║
║ ██║██╔██╗ ██║█████╗  ██║   ██║██████╔╝██╔████╔██║███████║██║     ██║   ██║█████╗  ███████╗   ║
║ ██║██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║╚██╔╝██║██╔══██║██║     ██║   ██║██╔══╝  ╚════██║   ║
║ ██║██║ ╚████║██║     ╚██████╔╝██║  ██║██║ ╚═╝ ██║██║  ██║╚██████╗╚██████╔╝███████╗███████║   ║
║ ╚═╝╚═╝  ╚═══╝╚═╝      ╚═════╝ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝   ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

➤ Responsável pelas rotas de consulta detalhada das entidades do sistema.

➤ Permite buscar informações de Traits, Limitations, Expertises, Expansions, Techniques e Magics através de uma única rota.

➤ O objeto models centraliza as entidades disponíveis para consulta e os relacionamentos carregados em cada uma delas.

➤ Disponibiliza um endpoint GET para buscar uma entidade específica através do seu tipo e ID.

➤ Os dados são consultados utilizando Prisma e retornados em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const models = {
  trait: {
    model: prisma.traits,
    include: {
      requirements: true,
      modifiers: true,
      effects: true,
      rules: true,
      types: {
        include: {
          types: true,
        },
      },
    },
  },

  limitation: {
    model: prisma.limitations,
    include: {
      types: {
        include: {
          types: true,
        },
      },
    },
  },

  expertise: {
    model: prisma.expertises,
    include: {
      requirements: true,
      difficulties: {
        include: {
          difficulty: true,
        },
      },
    },
  },

  expansion: {
    model: prisma.expansions,
    include: {
      types: {
        include: {
          types: true,
        },
      },
    },
  },

  technique: {
    model: prisma.techniques,
    include: {
      difficulties: {
        include: {
          difficulty: true,
        },
      },
    },
  },

  magic: {
    model: prisma.magics,
    include: {
      requirements: true,
      effects: true,
      classes: {
        include: {
          class: true,
        },
      },
      types: {
        include: {
          type: true,
        },
      },
    },
  },
};

router.get("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params;

    const config = models[type];

    if (!config) {
      return res.status(400).json({ error: "Tipo inválido." });
    }

    const item = await config.model.findUnique({ where: { id }, include: config.include });

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado." });
    }

    return res.json(item);
  } catch (error) {
    console.error(error);

    return res.status(500).json({ error: "Erro ao buscar informações." });
  }
});

export { router as informationRoutes };