const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const operacaoController = require("../controllers/operacaoController");
const authMiddleware = require("../middlewares/auth");
const { autorizarAdmin } = require("../middlewares/autorizacao");

// Validações para criar operação
const validarCriarOperacao = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("descricao").optional().trim(),
  body("tipo")
    .isIn(["soma", "subtracao", "multiplicacao", "divisao", "raiz"])
    .withMessage("Tipo deve ser: soma, subtracao, multiplicacao, divisao ou raiz"),
  body("min_parcela_1")
    .isInt()
    .withMessage("min_parcela_1 deve ser um número inteiro"),
  body("max_parcela_1")
    .isInt()
    .withMessage("max_parcela_1 deve ser um número inteiro"),
  body("min_parcela_2")
    .optional()
    .isInt()
    .withMessage("min_parcela_2 deve ser um número inteiro"),
  body("max_parcela_2")
    .optional()
    .isInt()
    .withMessage("max_parcela_2 deve ser um número inteiro"),
  body("min_parcela_3")
    .optional()
    .isInt()
    .withMessage("min_parcela_3 deve ser um número inteiro"),
  body("max_parcela_3")
    .optional()
    .isInt()
    .withMessage("max_parcela_3 deve ser um número inteiro"),
  body("id_plano")
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para atualizar operação
const validarAtualizarOperacao = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
  body("nome")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nome não pode estar vazio")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("descricao").optional().trim(),
  body("tipo")
    .optional()
    .isIn(["soma", "subtracao", "multiplicacao", "divisao", "raiz"])
    .withMessage("Tipo deve ser: soma, subtracao, multiplicacao, divisao ou raiz"),
  body("min_parcela_1")
    .optional()
    .isInt()
    .withMessage("min_parcela_1 deve ser um número inteiro"),
  body("max_parcela_1")
    .optional()
    .isInt()
    .withMessage("max_parcela_1 deve ser um número inteiro"),
  body("min_parcela_2")
    .optional()
    .isInt()
    .withMessage("min_parcela_2 deve ser um número inteiro"),
  body("max_parcela_2")
    .optional()
    .isInt()
    .withMessage("max_parcela_2 deve ser um número inteiro"),
  body("min_parcela_3")
    .optional()
    .isInt()
    .withMessage("min_parcela_3 deve ser um número inteiro"),
  body("max_parcela_3")
    .optional()
    .isInt()
    .withMessage("max_parcela_3 deve ser um número inteiro"),
  body("id_plano")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
];

// Validações para obter/excluir operação
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
router.get("/", authMiddleware, operacaoController.listar.bind(operacaoController));

router.get(
  "/:id",
  authMiddleware,
  validarId,
  operacaoController.obter.bind(operacaoController)
);

router.post(
  "/",
  authMiddleware,
  autorizarAdmin,
  validarCriarOperacao,
  operacaoController.criar.bind(operacaoController)
);

router.put(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarAtualizarOperacao,
  operacaoController.atualizar.bind(operacaoController)
);

router.delete(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarId,
  operacaoController.excluir.bind(operacaoController)
);

module.exports = router;

