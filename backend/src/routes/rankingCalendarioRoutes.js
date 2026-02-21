const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const rankingCalendarioController = require("../controllers/rankingCalendarioController");
const authMiddleware = require("../middlewares/auth");

// Validações para obter ranking de calendário
const validarObterRankingCalendario = [
  query("tipo")
    .notEmpty()
    .withMessage("tipo é obrigatório")
    .isString()
    .withMessage("tipo deve ser uma string"),
  query("limite_id")
    .notEmpty()
    .withMessage("limite_id é obrigatório")
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
  query("conjunto_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("conjunto_id deve ser um número inteiro válido"),
];

router.get(
  "/",
  authMiddleware,
  validarObterRankingCalendario,
  rankingCalendarioController.obterRanking.bind(rankingCalendarioController)
);

module.exports = router;

