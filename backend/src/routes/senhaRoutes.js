const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const senhaController = require("../controllers/senhaController");
const authMiddleware = require("../middlewares/auth");

const validarIniciarTreinoSenha = [
  body("digitos")
    .isInt({ min: 6, max: 10 })
    .withMessage("digitos deve ser um número entre 6 e 10"),
  body("tamanho")
    .isInt({ min: 3, max: 5 })
    .withMessage("tamanho deve ser um número entre 3 e 5"),
  body("repeticao")
    .isInt({ min: 0, max: 1 })
    .withMessage("repeticao deve ser 0 ou 1"),
];

const validarConfirmarInicioSenha = [
  body("treino_id").notEmpty().withMessage("treino_id é obrigatório").trim(),
];

const validarTentativaSenha = [
  body("treino_id").notEmpty().withMessage("treino_id é obrigatório").trim(),
  body("tentativa")
    .isArray()
    .withMessage("tentativa deve ser um array de algarismos"),
];

const validarFinalizarTreinoSenha = [
  body("treino_id").notEmpty().withMessage("treino_id é obrigatório").trim(),
];

router.post(
  "/treinos/iniciar",
  authMiddleware,
  validarIniciarTreinoSenha,
  senhaController.iniciarTreino.bind(senhaController)
);

router.post(
  "/treinos/confirmar-inicio",
  authMiddleware,
  validarConfirmarInicioSenha,
  senhaController.confirmarInicio.bind(senhaController)
);

router.post(
  "/treinos/tentativa",
  authMiddleware,
  validarTentativaSenha,
  senhaController.tentativa.bind(senhaController)
);

router.post(
  "/treinos/finalizar",
  authMiddleware,
  validarFinalizarTreinoSenha,
  senhaController.finalizarTreino.bind(senhaController)
);

module.exports = router;
