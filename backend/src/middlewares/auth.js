const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new AppError("Token não fornecido", 401));
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    // Buscar usuário e verificar se está ativo
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ association: "plano" }],
    });

    if (!usuario || !usuario.ativo) {
      return next(new AppError("Usuário inválido ou inativo", 401));
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
