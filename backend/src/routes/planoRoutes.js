const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const planoController = require("../controllers/planoController");
const authMiddleware = require("../middlewares/auth");
const { autorizarAdmin } = require("../middlewares/autorizacao");

// Validações para criar plano
const validarCriarPlano = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("descricao").optional().trim(),
  body("ordem")
    .isInt({ min: 1 })
    .withMessage("Ordem deve ser um número inteiro positivo"),
  body("conjuntos_criar")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Conjuntos criar deve ser um número inteiro não negativo"),
  body("conjuntos_participar")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Conjuntos participar deve ser um número inteiro não negativo"
    ),
];

// Validações para atualizar plano
const validarAtualizarPlano = [
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
  body("ordem")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Ordem deve ser um número inteiro positivo"),
  body("conjuntos_criar")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Conjuntos criar deve ser um número inteiro não negativo"),
  body("conjuntos_participar")
    .optional()
    .isInt({ min: 0 })
    .withMessage(
      "Conjuntos participar deve ser um número inteiro não negativo"
    ),
];

// Validações para obter/excluir plano
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
router.get("/", authMiddleware, planoController.listar.bind(planoController));

router.get(
  "/:id",
  authMiddleware,
  validarId,
  planoController.obter.bind(planoController)
);

router.post(
  "/",
  authMiddleware,
  autorizarAdmin,
  validarCriarPlano,
  planoController.criar.bind(planoController)
);

router.put(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarAtualizarPlano,
  planoController.atualizar.bind(planoController)
);

router.delete(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarId,
  planoController.excluir.bind(planoController)
);

module.exports = router;
