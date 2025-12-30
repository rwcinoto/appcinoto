const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");
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
}

module.exports = new AuthService();
