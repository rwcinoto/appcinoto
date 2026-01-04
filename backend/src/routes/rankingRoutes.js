const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const rankingController = require("../controllers/rankingController");
const authMiddleware = require("../middlewares/auth");

// Validações para obter ranking
const validarObterRanking = [
  query("operacao_id")
    .notEmpty()
    .withMessage("operacao_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("operacao_id deve ser um número inteiro válido"),
  query("limite_id")
    .notEmpty()
    .withMessage("limite_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
  query("sistema_id")
    .notEmpty()
    .withMessage("sistema_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("sistema_id deve ser um número inteiro válido"),
  query("conjunto_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("conjunto_id deve ser um número inteiro válido"),
];

// Validações para obter posição
const validarObterPosicao = [
  query("operacao_id")
    .notEmpty()
    .withMessage("operacao_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("operacao_id deve ser um número inteiro válido"),
  query("limite_id")
    .notEmpty()
    .withMessage("limite_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
  query("sistema_id")
    .notEmpty()
    .withMessage("sistema_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("sistema_id deve ser um número inteiro válido"),
  query("usuario_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("usuario_id deve ser um número inteiro válido"),
];

// Rotas
// GET /api/rankings - Obter ranking (filtros: operacao_id, limite_id, sistema_id, conjunto_id - opcional)
router.get(
  "/",
  authMiddleware,
  validarObterRanking,
  rankingController.obterRanking.bind(rankingController)
);

// GET /api/rankings/posicao - Obter apenas a posição do usuário no ranking global (usuario_id opcional)
router.get(
  "/posicao",
  authMiddleware,
  validarObterPosicao,
  rankingController.obterPosicao.bind(rankingController)
);

module.exports = router;

