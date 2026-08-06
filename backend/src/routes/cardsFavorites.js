/*
╔════════════════════════════════════════════════╗
║                                                ║
║ ███████╗██╗ ██████╗██╗  ██╗ █████╗ ███████╗    ║
║ ██╔════╝██║██╔════╝██║  ██║██╔══██╗██╔════╝    ║
║ █████╗  ██║██║     ███████║███████║███████╗    ║
║ ██╔══╝  ██║██║     ██╔══██║██╔══██║╚════██║    ║
║ ██║     ██║╚██████╗██║  ██║██║  ██║███████║    ║
║ ╚═╝     ╚═╝ ╚═════╝╚═╝  ╚═╝╚═╝  ╚═╝╚══════╝    ║
║                                                ║
╚════════════════════════════════════════════════╝

 ➤ Responsável pelas rotas relacionadas às Fichas (Cards).

 ➤ Disponibiliza endpoints GET para:
    - Listar todas as fichas.
    - Buscar uma ficha por ID.

 ➤ Disponibiliza endpoints POST para:
    - Criar uma nova ficha.
 
 ➤ Disponibiliza endpoints PUT para:
    - Atualizar uma ficha através do seu ID.
 
 ➤ Disponibiliza endpoints DELETE para:
    - Excluir uma ficha através do seu ID.

 ➤ Algumas rotas utilizam autenticação através do authMiddleware para garantir que o usuário esteja autenticado.

 ➤ Para atualizar ou excluir uma ficha, o sistema verifica se o usuário é o proprietário da ficha ou possui permissões de administrador.

 ➤ Os dados são consultados na tabela Cards através do Prisma.

 ➤ Os relacionamentos necessários são carregados utilizando o objeto cardInclude.

 ➤ O resultado é retornado em formato JSON para consumo pelo frontend.

*/


import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "./auth.js";

const router = Router();

// GET /favorites/:userId - Busca todos os favoritos de um usuário
router.get("/:userId", authMiddleware, async (req, res) => {
  const { userId } = req.params;

  // Verifica se o userId é válido
  if (!userId) {
    return res.status(400).json({ error: "ID de usuário inválido." });
  }

  try {
    const cardsFavorites = await prisma.cardsFavorites.findMany({
      where: { 
        userId: userId
      },
      include: {
        card: {
          include: {
            race: true,      // Inclui a raça da ficha
            user: true,      // Inclui o dono da ficha
            // Adicione outros includes se necessário
          }
        }
      },
    });

    return res.json(cardsFavorites);
  } catch (error) {
    console.error("Erro ao buscar fichas favoritas:", error);
    return res.status(500).json({ error: "Erro ao buscar fichas favoritas." });
  }
});

// POST /favorites - Adicionar um favorito
router.post("/", authMiddleware, async (req, res) => {
  const { userId, cardId } = req.body;

  if (!userId || !cardId) {
    return res.status(400).json({ error: "userId e cardId são obrigatórios." });
  }

  try {
    // Verifica se já existe
    const existing = await prisma.cardsFavorites.findFirst({
      where: {
        userId: userId,
        cardId: cardId
      }
    });

    if (existing) {
      return res.status(400).json({ error: "Ficha já está nos favoritos." });
    }

    const favorite = await prisma.cardsFavorites.create({
      data: {
        userId: userId,
        cardId: cardId
      },
      include: {
        card: true
      }
    });

    return res.status(201).json(favorite);
  } catch (error) {
    console.error("Erro ao adicionar favorito:", error);
    return res.status(500).json({ error: "Erro ao adicionar favorito." });
  }
});

// DELETE /favorites/:userId/:cardId - Remover um favorito
router.delete("/:userId/:cardId", authMiddleware, async (req, res) => {
  const { userId, cardId } = req.params;

  try {
    // Verifica se existe
    const favorite = await prisma.cardsFavorites.findFirst({
      where: {
        userId: userId,
        cardId: cardId
      }
    });

    if (!favorite) {
      return res.status(404).json({ error: "Favorito não encontrado." });
    }

    await prisma.cardsFavorites.delete({
      where: {
        id: favorite.id
      }
    });

    return res.json({ message: "Favorito removido com sucesso." });
  } catch (error) {
    console.error("Erro ao remover favorito:", error);
    return res.status(500).json({ error: "Erro ao remover favorito." });
  }
});

export { router as cardsFavorites };