/*
╔══════════════════════════════════════════════════════════════════╗
║                                                                  ║
║  ████████╗███████╗ ██████╗███╗   ██╗██╗ ██████╗ █████╗ ███████╗  ║
║  ╚══██╔══╝██╔════╝██╔════╝████╗  ██║██║██╔════╝██╔══██╗██╔════╝  ║
║     ██║   █████╗  ██║     ██╔██╗ ██║██║██║     ███████║███████╗  ║
║     ██║   ██╔══╝  ██║     ██║╚██╗██║██║██║     ██╔══██║╚════██║  ║
║     ██║   ███████╗╚██████╗██║ ╚████║██║╚██████╗██║  ██║███████║  ║
║     ╚═╝   ╚══════╝ ╚═════╝╚═╝  ╚═══╝╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝  ║
║                                                                  ║
╚══════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Técnicas (Techniques),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as técnicas.
    - Buscar uma técnicas por ID.

 ➤ Os dados são consultados na tabela Techniques através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto trechniqueInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.
*/

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const techniqueInclude = { difficulties: { include: { difficulty: true } }};

router.get("/", async (req, res) => {
  try {
    const techniques = await prisma.techniques.findMany({ include: techniqueInclude });

    return res.json(techniques);
  } catch (error) {
    console.error("Erro ao buscar técnicas:", error);
    return res.status(500).json({ error: "Erro ao buscar técnicas." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const technique = await prisma.techniques.findUnique({ where: { id }, include: techniqueInclude });

    if (!technique) {
      return res.status(404).json({ error: "Técnica não encontrada." });
    }

    return res.json(technique);
  } catch (error) {
    console.error("Erro ao buscar técnica:", error);
    return res.status(500).json({ error: "Erro ao buscar técnica." });
  }
});

export { router as techniqueRoutes };