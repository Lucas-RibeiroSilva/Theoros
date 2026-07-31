/*
╔════════════════════════════════════════════════╗
║                                                ║
║     ████████╗██╗██████╗  ██████╗ ███████╗      ║
║     ╚══██╔══╝██║██╔══██╗██╔═══██╗██╔════╝      ║
║        ██║   ██║██████╔╝██║   ██║███████╗      ║
║        ██║   ██║██╔═══╝ ██║   ██║╚════██║      ║
║        ██║   ██║██║     ╚██████╔╝███████║      ║
║        ╚═╝   ╚═╝╚═╝      ╚═════╝ ╚══════╝      ║
║                                                ║
╚════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas aos Tipos (Types).
 ➤ Disponibiliza um endpoint GET para listar todos os tipos cadastrados.
 ➤ Os dados são consultados na tabela Types através do Prisma.
 ➤ O resultado é retornado no formato JSON para consumo pelo frontend.

*/

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const types = await prisma.types.findMany();
    return res.json(types);
  } catch (error) {
    console.error("Erro ao buscar tipos:", error);
    return res.status(500).json({ error: "Erro ao buscar tipos." });
  }
});

export { router as typeRoutes };