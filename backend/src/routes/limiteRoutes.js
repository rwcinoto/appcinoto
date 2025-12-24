const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const limiteController = require("../controllers/limiteController");
const authMiddleware = require("../middlewares/auth");
const { autorizarAdmin } = require("../middlewares/autorizacao");

// Validações para criar limite
const validarCriarLimite = [
  body("descricao")
    .trim()
    .notEmpty()
    .withMessage("Descrição é obrigatória")
    .isLength({ min: 3 })
    .withMessage("Descrição deve ter no mínimo 3 caracteres"),
  body("tempo")
    .isInt({ min: 1 })
    .withMessage("Tempo deve ser um número inteiro positivo (em segundos)"),
  body("id_plano")
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para atualizar limite
const validarAtualizarLimite = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
  body("descricao")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Descrição não pode estar vazia")
    .isLength({ min: 3 })
    .withMessage("Descrição deve ter no mínimo 3 caracteres"),
  body("tempo")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Tempo deve ser um número inteiro positivo (em segundos)"),
  body("id_plano")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para obter/excluir limite
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
router.get("/", authMiddleware, limiteController.listar.bind(limiteController));

router.get(
  "/:id",
  authMiddleware,
  validarId,
  limiteController.obter.bind(limiteController)
);

router.post(
  "/",
  authMiddleware,
  autorizarAdmin,
  validarCriarLimite,
  limiteController.criar.bind(limiteController)
);

router.put(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarAtualizarLimite,
  limiteController.atualizar.bind(limiteController)
);

router.delete(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarId,
  limiteController.excluir.bind(limiteController)
);

module.exports = router;
