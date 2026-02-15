const express = require("express");
const router = express.Router();
const recordeVisitanteController = require("../controllers/recordeVisitanteController");
const authMiddleware = require("../middlewares/auth");
const { autorizarAdmin } = require("../middlewares/autorizacao");

// GET /api/visitantes/recordes - Listar quantidade de treinos por tipo (visitantes)
// Apenas admin
router.get(
  "/recordes",
  authMiddleware,
  autorizarAdmin,
  recordeVisitanteController.listar.bind(recordeVisitanteController)
);

module.exports = router;
