const { validationResult } = require("express-validator");
const authService = require("../services/authService");
const { AppError, formatValidationErrors } = require("../utils/errors");

class AuthController {
  async login(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorResponse = formatValidationErrors(errors.array());
        return res.status(errorResponse.statusCode).json({
          message: errorResponse.message,
          errors: errorResponse.errors,
        });
      }

      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);

      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async loginVisitante(req, res, next) {
    try {
      const resultado = await authService.loginVisitante();
      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async me(req, res, next) {
    try {
      const usuario = await req.usuario.reload({
        include: [{ association: "plano" }],
      });

      return res.json({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: usuario.id_plano,
        plano: usuario.plano,
        operacao_id: usuario.operacao_id,
        limite_id: usuario.limite_id,
        sistema_id: usuario.sistema_id,
        ranking_global: usuario.ranking_global,
        data_ultimo_treino: usuario.data_ultimo_treino,
        isVisitante: usuario.isVisitante || false,
      });
    } catch (error) {
      next(error);
    }
  }

  async solicitarResetSenha(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorResponse = formatValidationErrors(errors.array());
        return res.status(errorResponse.statusCode).json({
          message: errorResponse.message,
          errors: errorResponse.errors,
        });
      }

      const { email } = req.body;
      const resultado = await authService.solicitarResetSenha(email);

      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }

  async resetarSenha(req, res, next) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorResponse = formatValidationErrors(errors.array());
        return res.status(errorResponse.statusCode).json({
          message: errorResponse.message,
          errors: errorResponse.errors,
        });
      }

      const { token, senha } = req.body;
      const resultado = await authService.resetarSenha(token, senha);

      return res.json(resultado);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
