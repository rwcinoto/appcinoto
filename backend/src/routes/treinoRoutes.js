const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const treinoController = require("../controllers/treinoController");
const authMiddleware = require("../middlewares/auth");

// Validações para iniciar treino
const validarIniciarTreino = [
  body("operacao_id")
    .isInt({ min: 1 })
    .withMessage("ID da operação deve ser um número inteiro válido"),
  body("limite_id")
    .isInt({ min: 1 })
    .withMessage("ID do limite deve ser um número inteiro válido"),
  body("sistema_id")
    .isInt({ min: 1 })
    .withMessage("ID do sistema deve ser um número inteiro válido"),
];

// Validações para validar resposta
const validarResposta = [
  body("treino_id")
    .notEmpty()
    .withMessage("ID do treino é obrigatório")
    .trim(),
  body("resposta")
    .notEmpty()
    .withMessage("Resposta é obrigatória"),
  // resposta pode ser string (para romano/binário) ou number (para natural)
  // A validação específica será feita no controller conforme o sistema
];

// Validações para finalizar treino
const validarFinalizarTreino = [
  body("treino_id")
    .notEmpty()
    .withMessage("ID do treino é obrigatório")
    .trim(),
  body("total")
    .isInt({ min: 0 })
    .withMessage("Total deve ser um número inteiro não negativo"),
];

// Rotas
router.post(
  "/iniciar",
  authMiddleware,
  validarIniciarTreino,
  treinoController.iniciar.bind(treinoController)
);

router.post(
  "/validar-resposta",
  authMiddleware,
  validarResposta,
  treinoController.validarResposta.bind(treinoController)
);

router.post(
  "/finalizar",
  authMiddleware,
  validarFinalizarTreino,
  treinoController.finalizar.bind(treinoController)
);

module.exports = router;

