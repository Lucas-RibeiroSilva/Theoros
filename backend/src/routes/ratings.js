/*
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                                ║
║  █████╗ ██╗   ██╗ █████╗ ██╗     ██╗ █████╗  ██████╗ ██████╗ ███████╗███████╗  ║
║ ██╔══██╗██║   ██║██╔══██╗██║     ██║██╔══██╗██╔════╝██╔═══██╗██╔════╝██╔════╝  ║
║ ███████║██║   ██║███████║██║     ██║███████║██║     ██║   ██║█████╗  ███████╗  ║
║ ██╔══██║╚██╗ ██╔╝██╔══██║██║     ██║██╔══██║██║     ██║   ██║██╔══╝  ╚════██║  ║
║ ██║  ██║ ╚████╔╝ ██║  ██║███████╗██║██║  ██║╚██████╗╚██████╔╝███████╗███████║  ║
║ ╚═╝  ╚═╝  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═════╝ ╚══════╝╚══════╝  ║
║                                                                                ║
╚════════════════════════════════════════════════════════════════════════════════╝

  ➤ Responsável pelas rotas relacionadas às Avaliações (Ratings).

  ➤ Disponibiliza endpoints GET para:
    - Listar todas as avaliações de um card através do cardId.

  ➤ Disponibiliza endpoints POST para:
    - Criar uma nova avaliação.
    - Atualizar uma avaliação existente do mesmo usuário.

  ➤ As rotas de avaliação utilizam autenticação através do authMiddleware.

  ➤ Os dados são consultados na tabela Ratings através do Prisma.

  ➤ Após cada avaliação, a média do card é recalculada e atualizada automaticamente.

  ➤ O resultado é retornado em formato JSON para consumo pelo frontend.
*/


import { Router } from "express";
import prisma from "../prisma.js";
import { authMiddleware } from "./auth.js";
import { buildRatingSummarySelect } from "../utils/optimizedQueries.js";

const router = Router();

router.get("/:cardId/summary", async (req, res) => {
  const { cardId } = req.params;

  try {
    const ratings = await prisma.ratings.findMany({
      where: { cardId },
      select: buildRatingSummarySelect(),
    });

    return res.json(ratings);
  } catch (error) {
    console.error("Erro ao buscar avaliações em modo resumo:", error);
    return res.status(500).json({ error: "Erro ao buscar avaliações." });
  }
});

router.get("/:cardId", async (req, res) => {
  const { cardId } = req.params;

  try {
    const ratings = await prisma.ratings.findMany({
      where: { cardId },
      select: buildRatingSummarySelect(),
    });

    return res.json(ratings);
  } catch (error) {
    console.error("Erro ao buscar avaliações:", error);
    return res.status(500).json({ error: "Erro ao buscar avaliações." });
  }
});

router.post("/", authMiddleware, async (req, res) => {
  const { cardId, score, commentary } = req.body;

  if (!cardId || score == null) {
    return res.status(400).json({ error: "cardId e pontos são obrigatórios." });
  }

  if (score < 1 || score > 5) {
    return res.status(400).json({ error: "Pontuação deve ser entre 1 e 5." });
  }

  try {
    // Upsert: cria se não existir, atualiza se já existir
    const rating = await prisma.ratings.upsert({
      where: {
        userId_cardId: {
          userId: req.user.id,
          cardId,
        },
      },
      update: { score, commentary },
      create: {
        userId: req.user.id,
        cardId,
        score,
        commentary,
      },
    });

    // Recalcula a média da ficha
    const averageRating = await prisma.ratings.aggregate({
      where: { cardId },
      _avg: { score: true },
    });

    await prisma.card.update({
      where: { id: cardId },
      data: { ratingAverage: averageRating._avg.score },
    });

    return res.status(201).json(rating);
  } catch (error) {
    console.error("Erro ao avaliar ficha:", error);
    return res.status(500).json({ error: "Erro ao avaliar ficha." });
  }
});

export { router as ratingRoutes };