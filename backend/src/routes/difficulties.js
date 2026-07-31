/*
╔══════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                              ║
║ ██████╗ ██╗███████╗██╗ ██████╗██╗   ██╗██╗     ██████╗  █████╗ ██████╗ ███████╗███████╗      ║
║ ██╔══██╗██║██╔════╝██║██╔════╝██║   ██║██║     ██╔══██╗██╔══██╗██╔══██╗██╔════╝██╔════╝      ║
║ ██║  ██║██║█████╗  ██║██║     ██║   ██║██║     ██║  ██║███████║██║  ██║█████╗  ███████╗      ║
║ ██║  ██║██║██╔══╝  ██║██║     ██║   ██║██║     ██║  ██║██╔══██║██║  ██║██╔══╝  ╚════██║      ║
║ ██████╔╝██║██║     ██║╚██████╗╚██████╔╝███████╗██████╔╝██║  ██║██████╔╝███████╗███████║      ║
║ ╚═════╝ ╚═╝╚═╝     ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚═════╝ ╚═╝  ╚═╝╚═════╝ ╚══════╝╚══════╝      ║
║                                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas as Dificuldades (Difficulties).
 ➤ Disponibiliza um endpoint GET para listar todas as dificuldades cadastradas.
 ➤ Os dados são consultados na tabela Difficulties através do Prisma.
 ➤ O resultado é retornado no formato JSON para consumo pelo frontend.

*/

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const difficulties = await prisma.difficulties.findMany();
    return res.json(difficulties);
  } catch (error) {
    console.error("Erro ao buscar dificuldades:", error);
    return res.status(500).json({ error: "Erro ao buscar dificuldades." });
  }
});

export { router as difficultyRoutes };