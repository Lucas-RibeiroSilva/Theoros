/*
╔════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                                    ║
║   ██████╗ █████╗ ██████╗  █████╗  ██████╗████████╗███████╗██████╗ ██╗███████╗████████╗██╗ ██████╗ █████╗ ███████╗  ║
║  ██╔════╝██╔══██╗██╔══██╗██╔══██╗██╔════╝╚══██╔══╝██╔════╝██╔══██╗██║██╔════╝╚══██╔══╝██║██╔════╝██╔══██╗██╔════╝  ║
║  ██║     ███████║██████╔╝███████║██║        ██║   █████╗  ██████╔╝██║███████╗   ██║   ██║██║     ███████║███████╗  ║
║  ██║     ██╔══██║██╔══██╗██╔══██║██║        ██║   ██╔══╝  ██╔══██╗██║╚════██║   ██║   ██║██║     ██╔══██║╚════██║  ║
║   ██████╗██║  ██║██║  ██║██║  ██║╚██████╗   ██║   ███████╗██║  ██║██║███████║   ██║   ██║╚██████╗██║  ██║███████║  ║
║   ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝  ║
║                                                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Características (Traits),
    incluindo Vantagens e Desvantagens.

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as vantagens.
    - Buscar uma vantagem por ID. (exemplo /combat_reflexes)
    - Listar todas as desvantagens.
    - Buscar uma desvantagem por ID.

 ➤ Os dados são consultados na tabela Traits através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto traitInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.
*/

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Include padrão para traits (evita repetição)
const traitInclude = {
  types: { include: { type: true }, },
  requirements: true,
  restricts: true,
  blockedBy: true,
  modifiers: true,
  effects: true,
};

// ────────────────────────────── VANTAGENS ───────────────────────────────────────

router.get("/advantages", async (req, res) => {
  try {
    const advantages = await prisma.traits.findMany({ where: { isAdvantage: true }, include: traitInclude });

    return res.json(advantages);
  } catch (error) {
    console.error("Erro ao buscar vantagens:", error);
    return res.status(500).json({ error: "Erro ao buscar vantagens." });
  }
});

router.get("/advantages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const advantage = await prisma.traits.findFirst({ where: { id, isAdvantage: true }, include: traitInclude });

    if (!advantage) {
      return res.status(404).json({ error: "Vantagem não encontrada." });
    }

    return res.json(advantage);
  } catch (error) {
    console.error("Erro ao buscar vantagem:", error);
    return res.status(500).json({ error: "Erro ao buscar vantagem." });
  }
});

// ────────────────────────────── DESVANTAGENS ────────────────────────────────────

router.get("/disadvantages", async (req, res) => {
  try {
    const disadvantages = await prisma.traits.findMany({ where: { isAdvantage: false }, include: traitInclude });

    return res.json(disadvantages);
  } catch (error) {
    console.error("Erro ao buscar desvantagens:", error);
    return res.status(500).json({ error: "Erro ao buscar desvantagens." });
  }
});

router.get("/disadvantages/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const disadvantage = await prisma.traits.findFirst({ where: { id, isAdvantage: false }, include: traitInclude });

    if (!disadvantage) {
      return res.status(404).json({ error: "Desvantagem não encontrada." });
    }

    return res.json(disadvantage);
  } catch (error) {
    console.error("Erro ao buscar desvantagem:", error);
    return res.status(500).json({ error: "Erro ao buscar desvantagem." });
  }
});

export { router as traitRoutes };
