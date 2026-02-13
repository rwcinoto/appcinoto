const express = require("express");
const { query } = require("express-validator");
const router = express.Router();
const recordeCalendarioController = require("../controllers/recordeCalendarioController");
const authMiddleware = require("../middlewares/auth");

// Validações para listar recordes de calendário
const validarListarRecordesCalendario = [
  query("limite_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
  query("usuario_id")
    .optional()
    .isInt({ min: 0 })
    .withMessage("usuario_id deve ser um número inteiro válido"),
];

router.get(
  "/",
  authMiddleware,
  validarListarRecordesCalendario,
  recordeCalendarioController.listar.bind(recordeCalendarioController)
);

router.get(
  "/ultimos-batidos",
  authMiddleware,
  recordeCalendarioController.listarUltimosBatidos.bind(
    recordeCalendarioController
  )
);

module.exports = router;

