/*
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║ ██████╗ ███████╗██████╗ ██╗ ██████╗██╗ █████╗ ███████╗   ║
║ ██╔══██╗██╔════╝██╔══██╗██║██╔════╝██║██╔══██╗██╔════╝   ║
║ ██████╔╝█████╗  ██████╔╝██║██║     ██║███████║███████╗   ║
║ ██╔═══╝ ██╔══╝  ██╔══██╗██║██║     ██║██╔══██║╚════██║   ║
║ ██║     ███████╗██║  ██║██║╚██████╗██║██║  ██║███████║   ║
║ ╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝ ╚═════╝╚═╝╚═╝  ╚═╝╚══════╝   ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Péricias (Expertises),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as péricias.
    - Buscar uma péricia por ID.

 ➤ Os dados são consultados na tabela Expertises através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto expertiseInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const expertiseInclude = {
  difficulties: { include: { difficulty: true } },
  requirements: true,
};

router.get("/", async (req, res) => {
  try {
    const expertises = await prisma.expertises.findMany({ include: expertiseInclude });

    return res.json(expertises);
  } catch (error) {
    console.error("Erro ao buscar perícias:", error);
    return res.status(500).json({ error: "Erro ao buscar perícias." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const expertise = await prisma.expertises.findUnique({ where: { id }, include: expertiseInclude });

    if (!expertise) {
      return res.status(404).json({ error: "Perícia não encontrada." });
    }

    return res.json(expertise);
  } catch (error) {
    console.error("Erro ao buscar perícia:", error);
    return res.status(500).json({ error: "Erro ao buscar perícia." });
  }
});

export { router as expertiseRoutes };