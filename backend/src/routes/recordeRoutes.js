const express = require("express");
const { param, query } = require("express-validator");
const router = express.Router();
const recordeController = require("../controllers/recordeController");
const authMiddleware = require("../middlewares/auth");

// Validações para listar recordes (filtros opcionais)
const validarListarRecordes = [
  query("limite_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
  query("sistema_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("sistema_id deve ser um número inteiro válido"),
  query("usuario_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("usuario_id deve ser um número inteiro válido"),
];

// Validações para obter recorde específico
const validarId = [
  param("id")
    .isInt({ min: 1 })
    .withMessage("ID deve ser um número inteiro válido"),
];

// Rotas
// GET /api/recordes - Listar recordes do usuário logado ou de outro usuário (filtros: limite_id, sistema_id, usuario_id - opcional)
router.get(
  "/",
  authMiddleware,
  validarListarRecordes,
  recordeController.listar.bind(recordeController)
);

// GET /api/recordes/:id - Obter recorde específico
// A validação de que o recorde pertence ao usuário é feita no service
router.get(
  "/:id",
  authMiddleware,
  validarId,
  recordeController.obter.bind(recordeController)
);

module.exports = router;
