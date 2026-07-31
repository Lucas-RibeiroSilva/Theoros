/*
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║  ██████╗██╗      █████╗ ███████╗███████╗███████╗███████╗     ║
║ ██╔════╝██║     ██╔══██╗██╔════╝██╔════╝██╔════╝██╔════╝     ║
║ ██║     ██║     ███████║███████╗███████╗█████╗  ███████╗     ║
║ ██║     ██║     ██╔══██║╚════██║╚════██║██╔══╝  ╚════██║     ║
║ ╚██████╗███████╗██║  ██║███████║███████║███████╗███████║     ║
║  ╚═════╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚══════╝╚══════╝     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas as Classes (Classes).
 ➤ Disponibiliza um endpoint GET para listar todas as classes cadastradas.
 ➤ Os dados são consultados na tabela Classes através do Prisma.
 ➤ O resultado é retornado no formato JSON para consumo pelo frontend.

*/

import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();


router.get("/", async (req, res) => {
  try {
    const classes = await prisma.classes.findMany();
    return res.json(classes);
  } catch (error) {
    console.error("Erro ao buscar classes:", error);
    return res.status(500).json({ error: "Erro ao buscar classes." });
  }
});

export { router as classRoutes };