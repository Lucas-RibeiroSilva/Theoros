// O express é o framework web para Node.js que facilita a criação de servidores e APIs
import express from "express";
// Cors para permitir requisições de diferentes origens (domínios)
import cors from "cors";

// Importação das rotas organizadas por funcionalidade
import { authRoutes } from "./routes/auth.js";
import { traitRoutes } from "./routes/traits.js";
import { limitationRoutes } from "./routes/limitations.js";
import { cardRoutes } from "./routes/cards.js";
import { expertiseRoutes } from "./routes/expertises.js";
import { expansionRoutes } from "./routes/expansions.js";
import { techniqueRoutes } from "./routes/techniques.js";
import { magicRoutes } from "./routes/magics.js";
import { classRoutes } from "./routes/classes.js";
import { typeRoutes } from "./routes/types.js";
import { difficultyRoutes } from "./routes/difficulties.js";
import { raceRoutes } from "./routes/races.js";
import { ratingRoutes } from "./routes/ratings.js";
import { userRoutes } from "./routes/user.js";
import { cardsFavorites } from "./routes/cardsFavorites.js";

const app = express();
const PORT = process.env.PORT;

// ────────────────────────────── MIDDLEWARES ───────────────────────────────────────

// Configuração do CORS para permitir requisições apenas dos domínios autorizados
app.use(
  cors({
    origin: ["https://theoros.com.br", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// ────────────────────────────── ROTAS ───────────────────────────────────────────

app.use("/auth", authRoutes);
app.use("/traits", traitRoutes);
app.use("/limitations", limitationRoutes);
app.use("/cards", cardRoutes);
app.use("/expertises", expertiseRoutes);
app.use("/expansions", expansionRoutes);
app.use("/techniques", techniqueRoutes);
app.use("/magics", magicRoutes);
app.use("/classes", classRoutes);
app.use("/types", typeRoutes);
app.use("/difficulties", difficultyRoutes);
app.use("/races", raceRoutes);
app.use("/ratings", ratingRoutes);
app.use("/favorites", cardsFavorites);
app.use("/user", userRoutes);

// ────────────────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.clear(); // Limpa o console para uma apresentação mais limpa e profissional
  process.stdout.write("\x1Bc"); // Limpa o console (funciona em muitos terminais)

  console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║ ████████╗██╗  ██╗███████╗ ██████╗ ██████╗  ██████╗ ███████╗  ║
║ ╚══██╔══╝██║  ██║██╔════╝██╔═══██╗██╔══██╗██╔═══██╗██╔════╝  ║
║    ██║   ███████║█████╗  ██║   ██║██████╔╝██║   ██║███████╗  ║
║    ██║   ██╔══██║██╔══╝  ██║   ██║██╔══██╗██║   ██║╚════██║  ║
║    ██║   ██║  ██║███████╗╚██████╔╝██║  ██║╚██████╔╝███████║  ║
║    ╚═╝   ╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝  ║
║                                                              ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
║               ✦ NÚCLEO ARCANO DO REINO ✦                     ║
║                                                              ║
║  As engrenagens do mundo foram despertadas.                  ║
║  Os arquivos antigos ecoam pelos corredores.                 ║
║  Criaturas e dados agora respondem ao chamado.               ║
║                                                              ║
║  Backend Arcano: http://localhost:${PORT}/                      ║
║                                                              ║
║  ⚔ API: ONLINE                                               ║
║  Banco de dados sincronizado                                 ║
║  Rotas carregadas com sucesso                                ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);
});
