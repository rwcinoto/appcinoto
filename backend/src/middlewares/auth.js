const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario, Plano } = require("../models");
const { AppError } = require("../utils/errors");

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new AppError("Token não fornecido", 401));
    }

    const decoded = jwt.verify(token, jwtConfig.secret);

    // Verificar se é visitante (id === 0 ou isVisitante === true)
    const isVisitante = decoded.id === 0 || decoded.isVisitante === true;

    if (isVisitante) {
      // Buscar dados do plano id=2 do banco
      const plano = await Plano.findByPk(2);

      if (!plano) {
        return next(
          new AppError("Plano padrão para visitantes não encontrado", 500)
        );
      }

      // Criar objeto usuário visitante simulado sem buscar no banco
      const usuarioVisitante = {
        id: 0,
        email: "numix@cinoto.com.br",
        nome: "Visitante",
        tipo: "visitante",
        id_plano: 2,
        plano: plano,
        isVisitante: true,
        ativo: true,
        // Método reload simulado para compatibilidade com código existente
        reload: async function (options) {
          // Se o reload pedir para incluir o plano, garantir que está disponível
          if (options && options.include) {
            // O plano já está incluído, apenas retornar o objeto
            return this;
          }
          return this;
        },
      };

      req.usuario = usuarioVisitante;
    } else {
      // Buscar usuário real no banco e verificar se está ativo
      const usuario = await Usuario.findByPk(decoded.id, {
        include: [{ association: "plano" }],
      });

      if (!usuario || !usuario.ativo) {
        return next(new AppError("Usuário inválido ou inativo", 401));
      }

      req.usuario = usuario;
    }

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authMiddleware;
