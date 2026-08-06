/*
╔════════════════════════════════════════════════════════════════════════════════════════════════════╗
║                                                                                                    ║
║  █████╗ ██╗   ██╗████████╗███████╗███╗   ██╗████████╗██╗ ██████╗ █████╗  ██████╗ █████╗  ██████╗   ║
║ ██╔══██╗██║   ██║╚══██╔══╝██╔════╝████╗  ██║╚══██╔══╝██║██╔════╝██╔══██╗██╔════╝██╔══██╗██╔═══██╗  ║
║ ███████║██║   ██║   ██║   █████╗  ██╔██╗ ██║   ██║   ██║██║     ███████║██║     ███████║██║   ██║  ║
║ ██╔══██║██║   ██║   ██║   ██╔══╝  ██║╚██╗██║   ██║   ██║██║     ██╔══██║██║     ██╔══██║██║   ██║  ║
║ ██║  ██║╚██████╔╝   ██║   ███████╗██║ ╚████║   ██║   ██║╚██████╗██║  ██║╚██████╗██║  ██║╚██████╔╝  ║
║ ╚═╝  ╚═╝ ╚═════╝    ╚═╝   ╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝ ╚═════╝   ║
║                                                                                                    ║
╚════════════════════════════════════════════════════════════════════════════════════════════════════╝

➤ Responsável pelas rotas de autenticação e controle de acesso dos usuários.

➤ Define o authMiddleware, responsável por validar tokens JWT e proteger rotas que exigem autenticação.

➤ Disponibiliza a rota "guest-session" para gerar um token temporário de visitante com validade de 24 horas.

➤ Disponibiliza a rota "register" para cadastrar novos usuários.

➤ Antes de criar um usuário, o sistema verifica se o e-mail ou nome de usuário já estão cadastrados.

➤ As senhas são criptografadas utilizando bcrypt antes de serem armazenadas no banco de dados.

➤ Disponibiliza a rota "login" para autenticar usuários através de e-mail e senha.

➤ Durante o login, a senha informada é comparada com o hash armazenado no banco utilizando bcrypt.

➤ Após o registro ou login, um token JWT com validade de 7 dias é gerado e retornado ao usuário.

➤ Quando um token válido é enviado, o authMiddleware disponibiliza os dados do usuário em req.user para utilização nas rotas protegidas.

➤ Os dados dos usuários são consultados e armazenados na tabela User através do Prisma.

➤ As respostas são retornadas em formato JSON para consumo pelo frontend.

*/
import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../prisma.js";

const router = Router();

// ────────────────────────────── MIDDLEWARE ──────────────────────────────────────

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Token não enviado" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token inválido ou expirado" });
  }
}

// ────────────────────────────── SESSÃO VISITANTE ────────────────────────────────

router.post("/guest-session", (req, res) => {
  const guestToken = jwt.sign({ guest: true }, process.env.JWT_SECRET, {
    expiresIn: "24h",
  });

  return res.json({ guestToken });
});

// ────────────────────────────── REGISTRO ────────────────────────────────────────

router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const userExists = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (userExists) {
      return res
        .status(409)
        .json({ error: "E-mail ou usuário já cadastrado." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { username, email, password: hashedPassword },
    });

    const token = jwt.sign(
      { id: user.id, username: user.username, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res
      .status(201)
      .json({ token, id: user.id, username: user.username });
  } catch (error) {
    console.error("Erro no registro:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});

// ────────────────────────────── LOGIN ───────────────────────────────────────────

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Preencha todos os campos." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, admin: user.admin },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    return res.json({ token, id: user.id, username: user.username });
  } catch (error) {
    console.error("Erro no login:", error);
    return res.status(500).json({ error: "Erro interno no servidor." });
  }
});


export { router as authRoutes };
