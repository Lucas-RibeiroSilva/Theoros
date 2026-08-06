/*
╔════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                    ║
║  █████╗ ███╗   ███╗██████╗ ██╗     ██╗ █████╗  ██████╗ ██████╗ ███████╗███████╗    ║
║ ██╔══██╗████╗ ████║██╔══██╗██║     ██║██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔════╝    ║
║ ███████║██╔████╔██║██████╔╝██║     ██║███████║██║     ██║   ██║█████╗  ███████╗    ║
║ ██╔══██║██║╚██╔╝██║██╔═══╝ ██║     ██║██╔══██║██║     ██║   ██║██╔══╝  ╚════██║    ║
║ ██║  ██║██║ ╚═╝ ██║██║     ███████╗██║██║  ██║╚██████╗╚██████╔╝███████╗███████║    ║
║ ╚═╝  ╚═╝╚═╝     ╚═╝╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝    ║
║                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Ampliações (Expansions),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as ampliações.
    - Buscar uma ampliação por ID.

 ➤ Os dados são consultados na tabela Expansions através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto expansionInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const expansionInclude = { types: { include: { type: true } }};

router.get("/", async (req, res) => {
  try {
    const expansions = await prisma.expansions.findMany({ include: expansionInclude });

    return res.json(expansions);
  } catch (error) {
    console.error("Erro ao buscar ampliações:", error);
    return res.status(500).json({ error: "Erro ao buscar ampliações." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const expansion = await prisma.expansions.findUnique({ where: { id }, include: expansionInclude });

    if (!expansion) {
      return res.status(404).json({ error: "Ampliação não encontrada." });
    }

    return res.json(expansion);
  } catch (error) {
    console.error("Erro ao buscar ampliação:", error);
    return res.status(500).json({ error: "Erro ao buscar ampliação." });
  }
});

export { router as expansionRoutes };