const jwt = require("jsonwebtoken");
const jwtConfig = require("../config/jwt");
const { Usuario } = require("../models");

class AuthService {
  async login(email, senha) {
    const usuario = await Usuario.findOne({
      where: { email },
      include: [{ association: "plano" }],
    });

    if (!usuario) {
      throw new Error("Email ou senha inválidos");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    const senhaValida = await usuario.verificarSenha(senha);

    if (!senhaValida) {
      throw new Error("Email ou senha inválidos");
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
