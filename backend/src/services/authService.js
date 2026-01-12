const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario, Plano } = require("../models");
const { AppError } = require("../utils/errors");

class AuthService {
  async login(email, senha) {
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ association: "plano" }],
    });

    if (!usuario) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    if (!usuario.ativo) {
      throw new AppError("Usuário inativo", 401);
    }

    const senhaValida = await usuario.verificarSenha(senha);

    if (!senhaValida) {
      throw new AppError("Email ou senha inválidos", 401);
    }

    const token = this.gerarToken(usuario);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: usuario.id_plano,
        plano: usuario.plano,
      },
    };
  }

  gerarToken(usuario) {
    const payload = {
      id: usuario.id,
      email: usuario.email,
      tipo: usuario.tipo,
      id_plano: usuario.id_plano,
    };

    return jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });
  }

  async loginVisitante() {
    // Buscar dados do plano id=2
    const plano = await Plano.findByPk(2);

    if (!plano) {
      throw new AppError("Plano padrão para visitantes não encontrado", 500);
    }

    // Gerar token JWT para visitante
    const payload = {
      id: 0, // ID fixo para visitantes
      tipo: "visitante",
      id_plano: 2,
      isVisitante: true,
    };

    const token = jwt.sign(payload, jwtConfig.secret, {
      expiresIn: jwtConfig.expiresIn,
    });

    // Retornar dados simulados do visitante
    return {
      token,
      usuario: {
        id: 0,
        email: "numix@cinoto.com.br",
        nome: "Visitante",
        tipo: "visitante",
        id_plano: 2,
        plano: plano,
        isVisitante: true,
      },
    };
  }
}

module.exports = new AuthService();
