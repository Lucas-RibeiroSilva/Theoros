/*
╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║ ██╗     ██╗███╗   ███╗██╗████████╗ █████╗  ██████╗ ██████╗ ███████╗███████╗  ║
║ ██║     ██║████╗ ████║██║╚══██╔══╝██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔════╝  ║
║ ██║     ██║██╔████╔██║██║   ██║   ███████║██║     ██║   ██║█████╗  ███████╗  ║
║ ██║     ██║██║╚██╔╝██║██║   ██║   ██╔══██║██║     ██║   ██║██╔══╝  ╚════██║  ║
║ ███████╗██║██║ ╚═╝ ██║██║   ██║   ██║  ██║╚██████╗╚██████╔╝███████╗███████║  ║
║ ╚══════╝╚═╝╚═╝     ╚═╝╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝  ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Limitações (Limitations),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as limitações.
    - Buscar uma limitação por ID.

 ➤ Os dados são consultados na tabela Limitations através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto limitationInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";


const router = Router();

const limitationInclude = {
  types: {
    include: { type: true },
  },
};

router.get("/", async (req, res) => {
  try {
    const limitations = await prisma.limitations.findMany({ include: limitationInclude });

    return res.json(limitations);
  } catch (error) {
    console.error("Erro ao buscar limitações:", error);
    return res.status(500).json({ error: "Erro ao buscar limitações." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const limitation = await prisma.limitations.findUnique({ where: { id }, include: limitationInclude });

    if (!limitation) {
      return res.status(404).json({ error: "Limitação não encontrada." });
    }

    return res.json(limitation);
  } catch (error) {
    console.error("Erro ao buscar limitação:", error);
    return res.status(500).json({ error: "Erro ao buscar limitação." });
  }
});

export { router as limitationRoutes };