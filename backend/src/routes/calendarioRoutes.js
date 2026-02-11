const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const calendarioController = require("../controllers/calendarioController");
const authMiddleware = require("../middlewares/auth");

// Validações para iniciar treino de calendário
const validarIniciarTreinoCalendario = [
  body("tipo")
    .notEmpty()
    .withMessage("tipo é obrigatório")
    .isString()
    .withMessage("tipo deve ser uma string"),
  body("limite_id")
    .isInt({ min: 1 })
    .withMessage("limite_id deve ser um número inteiro válido"),
];

// Validações para validar resposta de calendário
const validarRespostaCalendario = [
  body("treino_id")
    .notEmpty()
    .withMessage("treino_id é obrigatório")
    .trim(),
  body("resposta")
    .notEmpty()
    .withMessage("Resposta é obrigatória"),
];

// Validações para finalizar treino de calendário
const validarFinalizarTreinoCalendario = [
  body("treino_id")
    .notEmpty()
    .withMessage("treino_id é obrigatório")
    .trim(),
  body("total")
    .optional()
    .isInt({ min: 0 })
    .withMessage("total deve ser um número inteiro não negativo"),
];

// Validações para confirmar início do treino de calendário
const validarConfirmarInicioCalendario = [
  body("treino_id")
    .notEmpty()
    .withMessage("treino_id é obrigatório")
    .trim(),
];

// Rotas de treinos de calendário
router.post(
  "/treinos/iniciar",
  authMiddleware,
  validarIniciarTreinoCalendario,
  calendarioController.iniciarTreino.bind(calendarioController)
);

router.post(
  "/treinos/confirmar-inicio",
  authMiddleware,
  validarConfirmarInicioCalendario,
  calendarioController.confirmarInicio.bind(calendarioController)
);

router.post(
  "/treinos/validar-resposta",
  authMiddleware,
  validarRespostaCalendario,
  calendarioController.validarResposta.bind(calendarioController)
);

router.post(
  "/treinos/finalizar",
  authMiddleware,
  validarFinalizarTreinoCalendario,
  calendarioController.finalizarTreino.bind(calendarioController)
);

module.exports = router;

