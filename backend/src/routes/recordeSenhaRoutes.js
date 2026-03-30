const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const recordeSenhaController = require("../controllers/recordeSenhaController");
const authMiddleware = require("../middlewares/auth");

const validarListarRecordesSenha = [
  query("digitos")
    .optional()
    .isInt({ min: 6, max: 10 })
    .withMessage("digitos deve ser um número entre 6 e 10"),
  query("tamanho")
    .optional()
    .isInt({ min: 3, max: 5 })
    .withMessage("tamanho deve ser um número entre 3 e 5"),
  query("repeticao")
    .optional()
    .isInt({ min: 0, max: 1 })
    .withMessage("repeticao deve ser 0 ou 1"),
  query("usuario_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("usuario_id deve ser um número inteiro válido"),
];

router.get(
  "/",
  authMiddleware,
  validarListarRecordesSenha,
  recordeSenhaController.listar.bind(recordeSenhaController)
);

router.get(
  "/ultimos-batidos",
  authMiddleware,
  recordeSenhaController.listarUltimosBatidos.bind(recordeSenhaController)
);

module.exports = router;
