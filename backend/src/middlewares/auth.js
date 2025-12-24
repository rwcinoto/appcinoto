const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({ message: "Token não fornecido" });
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    // Buscar usuário e verificar se está ativo
    const usuario = await Usuario.findByPk(decoded.id, {
      include: [{ association: "plano" }],
    });

    if (!usuario || !usuario.ativo) {
      return res.status(401).json({ message: "Usuário inválido ou inativo" });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Token inválido" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expirado" });
    }
    return res.status(500).json({ message: "Erro na autenticação" });
  }
};

module.exports = authMiddleware;
