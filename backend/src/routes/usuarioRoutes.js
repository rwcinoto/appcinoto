const express = require("express");
const { body, param, query } = require("express-validator");
const router = express.Router();
const usuarioController = require("../controllers/usuarioController");
const authMiddleware = require("../middlewares/auth");
const {
  autorizarAdmin,
  autorizarAdminOuProfe,
  autorizarProprioOuAdmin,
  autorizarProprioOuAdminOuProfe,
} = require("../middlewares/autorizacao");

// Validações para criar usuário
const validarCriarUsuario = [
  body("email").isEmail().withMessage("Email inválido"),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
  body("nome")
    .trim()
    .notEmpty()
    .withMessage("Nome é obrigatório")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("tipo")
    .optional()
    .isIn(["admin", "comum", "profe"])
    .withMessage("Tipo deve ser 'admin', 'comum' ou 'profe'"),
  body("id_plano")
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
  body("ativo")
    .optional()
    .isBoolean()
    .withMessage("Ativo deve ser true ou false"),
];

// Validações para atualizar usuário
const validarAtualizarUsuario = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Email inválido"),
  body("senha")
    .optional()
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
  body("nome")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Nome não pode estar vazio")
    .isLength({ min: 3 })
    .withMessage("Nome deve ter no mínimo 3 caracteres"),
  body("tipo")
    .optional()
    .isIn(["admin", "comum", "profe"])
    .withMessage("Tipo deve ser 'admin', 'comum' ou 'profe'"),
  body("id_plano")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
  body("ativo")
    .optional()
    .isBoolean()
    .withMessage("Ativo deve ser true ou false"),
];

// Validações para listar usuários
const validarListarUsuarios = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Página deve ser um número inteiro positivo"),
  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limite deve ser um número entre 1 e 100"),
  query("tipo")
    .optional()
    .isIn(["admin", "comum", "profe"])
    .withMessage("Tipo deve ser 'admin', 'comum' ou 'profe'"),
  query("ativo")
    .optional()
    .isIn(["true", "false"])
    .withMessage("Ativo deve ser 'true' ou 'false'"),
  query("id_plano")
    .optional()
    .isInt({ min: 1 })
    .withMessage("ID do plano deve ser um número inteiro válido"),
  query("busca")
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage("Busca não pode estar vazia"),
];

// Validações para obter/excluir usuário
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
router.get(
  "/",
  authMiddleware,
  autorizarAdminOuProfe,
  validarListarUsuarios,
  usuarioController.listar.bind(usuarioController)
);

// Rota para listar convites pendentes do usuário logado
// DEVE vir ANTES da rota /:id para evitar conflito de rotas
router.get(
  "/convites-pendentes",
  authMiddleware,
  require("../controllers/usuarioConjuntoController").listarConvitesPendentes.bind(
    require("../controllers/usuarioConjuntoController")
  )
);

// Rota pública para buscar apenas nome do usuário (para visualizar recordes)
// DEVE vir ANTES da rota /:id para evitar conflito de rotas
router.get(
  "/:id/nome",
  authMiddleware,
  validarId,
  usuarioController.obterNome.bind(usuarioController)
);

router.get(
  "/:id",
  authMiddleware,
  autorizarProprioOuAdmin,
  validarId,
  usuarioController.obter.bind(usuarioController)
);

router.post(
  "/",
  authMiddleware,
  autorizarAdminOuProfe,
  validarCriarUsuario,
  usuarioController.criar.bind(usuarioController)
);

router.put(
  "/:id",
  authMiddleware,
  autorizarProprioOuAdminOuProfe,
  validarAtualizarUsuario,
  usuarioController.atualizar.bind(usuarioController)
);

router.delete(
  "/:id",
  authMiddleware,
  autorizarAdmin,
  validarId,
  usuarioController.excluir.bind(usuarioController)
);

module.exports = router;
