const express = require("express");
const { body, param } = require("express-validator");
const router = express.Router();
const conjuntoController = require("../controllers/conjuntoController");
const usuarioConjuntoController = require("../controllers/usuarioConjuntoController");
const authMiddleware = require("../middlewares/auth");

// Validações para criar conjunto
const validarCriarConjunto = [
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 1 })
    .withMessage("Nome não pode estar vazio"),
];

// Validações para atualizar conjunto
const validarAtualizarConjunto = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 1 })
    .withMessage("Nome não pode estar vazio"),
];

// Validações para obter/excluir conjunto
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Validações para conjunto_id (rotas aninhadas)
const validarConjuntoId = [
  param("conjunto_id")
    .isInt({ min: 1 })
    .withMessage("ID do conjunto deve ser um número inteiro válido"),
];

// Validações para usuario_id
const validarUsuarioId = [
  param("usuario_id")
    .isInt({ min: 1 })
    .withMessage("ID do usuário deve ser um número inteiro válido"),
];

// Validações para convidar usuário
const validarConvidar = [
  ...validarConjuntoId,
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email é obrigatório")
    .isEmail()
    .withMessage("Email deve ser válido"),
];

// Validações para atualizar tipo
const validarAtualizarTipo = [
  ...validarConjuntoId,
  ...validarUsuarioId,
  body("tipo")
    .isIn(["admin", "comum"])
    .withMessage("Tipo deve ser 'admin' ou 'comum'"),
];

// Rotas
router.get(
  "/",
  authMiddleware,
  conjuntoController.listar.bind(conjuntoController)
);

// Rotas aninhadas de usuários-conjuntos (devem vir antes de /:id)
router.get(
  "/:conjunto_id/usuarios",
  authMiddleware,
  validarConjuntoId,
  usuarioConjuntoController.listarUsuarios.bind(usuarioConjuntoController)
);

router.post(
  "/:conjunto_id/usuarios",
  authMiddleware,
  validarConvidar,
  usuarioConjuntoController.convidar.bind(usuarioConjuntoController)
);

router.put(
  "/:conjunto_id/usuarios/:usuario_id",
  authMiddleware,
  validarAtualizarTipo,
  usuarioConjuntoController.atualizarTipo.bind(usuarioConjuntoController)
);

router.delete(
  "/:conjunto_id/usuarios/:usuario_id",
  authMiddleware,
  validarConjuntoId,
  validarUsuarioId,
  usuarioConjuntoController.remover.bind(usuarioConjuntoController)
);

router.post(
  "/:conjunto_id/usuarios/:usuario_id/aceitar",
  authMiddleware,
  validarConjuntoId,
  validarUsuarioId,
  usuarioConjuntoController.aceitarConvite.bind(usuarioConjuntoController)
);

router.post(
  "/:conjunto_id/usuarios/:usuario_id/rejeitar",
  authMiddleware,
  validarConjuntoId,
  validarUsuarioId,
  usuarioConjuntoController.rejeitarConvite.bind(usuarioConjuntoController)
);

router.get(
  "/:id",
  authMiddleware,
  validarId,
  conjuntoController.obter.bind(conjuntoController)
);

router.post(
  "/",
  authMiddleware,
  validarCriarConjunto,
  conjuntoController.criar.bind(conjuntoController)
);

router.put(
  "/:id",
  authMiddleware,
  validarAtualizarConjunto,
  conjuntoController.atualizar.bind(conjuntoController)
);

router.delete(
  "/:id",
  authMiddleware,
  validarId,
  conjuntoController.excluir.bind(conjuntoController)
);

module.exports = router;

