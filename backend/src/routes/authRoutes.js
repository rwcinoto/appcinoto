const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/auth");

// Validações
const validarLogin = [
  body("email").isEmail().withMessage("Email inválido"),
  body("senha")
    .isLength({ min: 6 })
    .withMessage("Senha deve ter no mínimo 6 caracteres"),
];

// Rotas
router.post("/login", validarLogin, authController.login.bind(authController));
router.get("/me", authMiddleware, authController.me.bind(authController));

module.exports = router;
