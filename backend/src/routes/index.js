const express = require("express");
const router = express.Router();

// Rota de health check
router.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API funcionando" });
});

// Rotas de autenticação
router.use("/auth", require("./authRoutes"));

// Rotas de usuários
router.use("/usuarios", require("./usuarioRoutes"));

// Rotas de planos
router.use("/planos", require("./planoRoutes"));

// Rotas de operações
router.use("/operacoes", require("./operacaoRoutes"));

// Rotas de limites
router.use("/limites", require("./limiteRoutes"));

// Rotas de sistemas
router.use("/sistemas", require("./sistemaRoutes"));

// Rotas de treinos
router.use("/treinos", require("./treinoRoutes"));

// Rotas de recordes
router.use("/recordes", require("./recordeRoutes"));

// Rotas de rankings
router.use("/rankings", require("./rankingRoutes"));

// Rotas de conjuntos
router.use("/conjuntos", require("./conjuntoRoutes"));

module.exports = router;
