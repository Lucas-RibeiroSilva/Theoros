/*
╔══════════════════════════════════════════════╗
║                                              ║
║ ██████╗  █████╗  ██████╗ █████╗ ███████╗     ║
║ ██╔══██╗██╔══██╗██╔════╝██╔══██╗██╔════╝     ║
║ ██████╔╝███████║██║     ███████║███████╗     ║
║ ██╔══██╗██╔══██║██║     ██╔══██║╚════██║     ║
║ ██║  ██║██║  ██║╚██████╗██║  ██║███████║     ║
║                                              ║
╚══════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Raças (Races),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as raças.
    - Buscar uma raça por ID.

 ➤ Os dados são consultados na tabela Races através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto raceInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const raceInclude = {
  modifiers: true,
};

router.get("/", async (req, res) => {
  try {
    const races = await prisma.races.findMany({ include: raceInclude });

    return res.json(races);
  } catch (error) {
    console.error("Erro ao buscar raças:", error);
    return res.status(500).json({ error: "Erro ao buscar raças." });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);

  if (isNaN(id)) {
    return res.status(400).json({ error: "ID inválido." });
  }

  try {
    const race = await prisma.races.findUnique({ where: { id }, include: raceInclude });

    if (!race) {
      return res.status(404).json({ error: "Raça não encontrada." });
    }

    return res.json(race);
  } catch (error) {
    console.error("Erro ao buscar raça:", error);
    return res.status(500).json({ error: "Erro ao buscar raça." });
  }
});

export { router as raceRoutes };