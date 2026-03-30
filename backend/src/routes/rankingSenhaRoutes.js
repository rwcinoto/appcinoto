const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const rankingSenhaController = require("../controllers/rankingSenhaController");
const authMiddleware = require("../middlewares/auth");

const validarObterRankingSenha = [
  query("digitos")
    .notEmpty()
    .withMessage("digitos é obrigatório")
    .isInt({ min: 6, max: 10 })
    .withMessage("digitos deve ser um número entre 6 e 10"),
  query("tamanho")
    .notEmpty()
    .withMessage("tamanho é obrigatório")
    .isInt({ min: 3, max: 5 })
    .withMessage("tamanho deve ser um número entre 3 e 5"),
  query("repeticao")
    .notEmpty()
    .withMessage("repeticao é obrigatório")
    .isInt({ min: 0, max: 1 })
    .withMessage("repeticao deve ser 0 ou 1"),
  query("conjunto_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("conjunto_id deve ser um número inteiro válido"),
];

router.get(
  "/",
  authMiddleware,
  validarObterRankingSenha,
  rankingSenhaController.obterRanking.bind(rankingSenhaController)
);

module.exports = router;
