/*
╔════════════════════════════════════════════════════╗
║                                                    ║
║ ███╗   ███╗ █████╗  ██████╗ ██╗ █████╗ ███████╗    ║
║ ████╗ ████║██╔══██╗██╔════╝ ██║██╔══██╗██╔════╝    ║
║ ██╔████╔██║███████║██║  ███╗██║███████║███████╗    ║
║ ██║╚██╔╝██║██╔══██║██║   ██║██║██╔══██║╚════██║    ║
║ ██║ ╚═╝ ██║██║  ██║╚██████╔╝██║██║  ██║███████║    ║
║ ╚═╝     ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝╚═╝  ╚═╝╚══════╝    ║
║                                                    ║
╚════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Mágias (Magics),

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as maǵias.
    - Buscar uma mágia por ID.

 ➤ Os dados são consultados na tabela Races através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto magicInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

const magicInclude = {
  types: { include: { type: true } },
  classes: { include: { class: true } },
  requirements: true,
  effects: true,
};

router.get("/", async (req, res) => {
  try {
    const magics = await prisma.magics.findMany({ include: magicInclude });

    return res.json(magics);
  } catch (error) {
    console.error("Erro ao buscar magias:", error);
    return res.status(500).json({ error: "Erro ao buscar magias." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const magic = await prisma.magics.findUnique({ where: { id }, include: magicInclude });

    if (!magic) {
      return res.status(404).json({ error: "Magia não encontrada." });
    }

    return res.json(magic);
  } catch (error) {
    console.error("Erro ao buscar magia:", error);
    return res.status(500).json({ error: "Erro ao buscar magia." });
  }
});

export { router as magicRoutes };