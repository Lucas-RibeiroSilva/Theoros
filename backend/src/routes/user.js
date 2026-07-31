/*

╔══════════════════════════════════════════════════════════════════════════════╗
║                                                                              ║
║ ██╗   ██╗███████╗██╗   ██╗ █████╗ ██████╗ ██╗ ██████╗                        ║
║ ██║   ██║██╔════╝██║   ██║██╔══██╗██╔══██╗██║██╔═══██╗                       ║
║ ██║   ██║███████╗██║   ██║███████║██████╔╝██║██║   ██║                       ║
║ ██║   ██║╚════██║██║   ██║██╔══██║██╔══██╗██║██║   ██║                       ║
║ ╚██████╔╝███████║╚██████╔╝██║  ██║██║  ██║██║╚██████╔╝                       ║
║  ╚═════╝ ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝ ╚═════╝                        ║
║                                                                              ║
╚══════════════════════════════════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas aos Usuários (User).
 ➤ Disponibiliza um endpoint GET para listar todos os usuários cadastrados.
 ➤ Os dados são consultados na tabela User através do Prisma.
 ➤ /me serve para trazer os dados do próprio usuário e não dos outros
 ➤ O resultado é retornado no formato JSON para consumo pelo frontend.

*/

import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "./auth.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    return res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return res.status(500).json({ error: "Erro ao buscar usuários." });
  }
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const users = await prisma.user.findUnique({
      where: { id },
    });

    if (!users) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    return res.json(users);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

router.post("/:id/image", async (req, res) => {
  const { id } = req.params;
  const { image } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { image },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

router.post("/:id/username", async (req, res) => {
  const { id } = req.params;
  const { username } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { username },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

router.post("/:id/description", async (req, res) => {
  const { id } = req.params;
  const { description } = req.body;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: { description },
    });

    if (!user) {
      return res.status(404).json({
        error: "Usuário não encontrado",
      });
    }

    return res.json(user);
  } catch (error) {
    console.error("Erro ao buscar usuário:", error);
    return res.status(500).json({ error: "Erro ao buscar usuário." });
  }
});

export { router as userRoutes };
