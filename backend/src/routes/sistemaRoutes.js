const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const sistemaController = require("../controllers/sistemaController");
const authMiddleware = require("../middlewares/auth");
const { autorizarAdmin } = require("../middlewares/autorizacao");

// Validações para criar sistema
const validarCriarSistema = [
  body("descricao").optional().trim(),
  body("tipo")
    .isIn(["natural", "romano", "binario", "inteiro"])
    .withMessage("Tipo deve ser: natural, romano, binario ou inteiro"),
  body("id_plano")
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para atualizar sistema
const validarAtualizarSistema = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
  body("descricao").optional().trim(),
  body("tipo")
    .optional()
    .isIn(["natural", "romano", "binario", "inteiro"])
    .withMessage("Tipo deve ser: natural, romano, binario ou inteiro"),
  body("id_plano")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para obter/excluir sistema
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
router.get("/", authMiddleware, sistemaController.listar.bind(sistemaController));

router.get(
  "/:id",
  authMiddleware,
  validarId,
  sistemaController.obter.bind(sistemaController)
);

router.post(
  "/",
  authMiddleware,
  autorizarAdmin,
  validarCriarSistema,
  sistemaController.criar.bind(sistemaController)
);

router.put(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarAtualizarSistema,
  sistemaController.atualizar.bind(sistemaController)
);

router.delete(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarId,
  sistemaController.excluir.bind(sistemaController)
);

module.exports = router;

