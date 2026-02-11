const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const jwtConfig = require("../config/jwt");
const { Usuario, Plano } = require("../models");
const { AppError } = require("../utils/errors");
const emailService = require("./emailService");

class AuthService {
  /**
   * Verifica o plano válido baseado na data de vencimento
   * @param {Usuario} usuario - Instância do usuário
   * @returns {Promise<{id_plano: number, plano: Plano}>} - ID do plano válido e objeto do plano
   */
  async obterPlanoValido(usuario) {
    // Se não há data de vencimento, usa o plano do cadastro
    if (!usuario.data_vencimento_plano) {
      const plano = await Plano.findByPk(usuario.id_plano);
      if (!plano) {
        throw new AppError(`Plano com id ${usuario.id_plano} não encontrado`, 500);
      }
      return {
        id_plano: usuario.id_plano,
        plano: plano,
      };
    }

    // Comparar apenas a data (sem hora) para evitar problemas de timezone
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const dataVencimento = new Date(usuario.data_vencimento_plano);
    dataVencimento.setHours(0, 0, 0, 0);

    // Se a data de vencimento já passou, usar plano id = 2
    if (dataVencimento < hoje) {
      const plano = await Plano.findByPk(2);
      if (!plano) {
        throw new AppError("Plano padrão (id=2) não encontrado", 500);
      }
      return {
        id_plano: 2,
        plano: plano,
      };
    }

    // Se a data de vencimento é hoje ou futura, usar o plano do cadastro
    const plano = await Plano.findByPk(usuario.id_plano);
    if (!plano) {
      throw new AppError(`Plano com id ${usuario.id_plano} não encontrado`, 500);
    }
    return {
      id_plano: usuario.id_plano,
      plano: plano,
    };
  }

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

    // Verificar plano válido baseado na data de vencimento
    const planoValido = await this.obterPlanoValido(usuario);

    // Criar objeto usuário com plano válido para o token
    const usuarioParaToken = {
      ...usuario.toJSON(),
      id_plano: planoValido.id_plano,
      plano: planoValido.plano,
    };

    const token = this.gerarToken(usuarioParaToken);

    return {
      token,
      usuario: {
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: planoValido.id_plano,
        plano: planoValido.plano,
        operacao_id: usuario.operacao_id,
        limite_id: usuario.limite_id,
        sistema_id: usuario.sistema_id,
        ranking_global: usuario.ranking_global,
        data_ultimo_treino: usuario.data_ultimo_treino,
        calendario_tipo_treino: usuario.calendario_tipo_treino,
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

  async solicitarResetSenha(email) {
    const usuario = await Usuario.findOne({ where: { email } });

    // Por segurança, não informamos se o email existe ou não
    if (!usuario || !usuario.ativo) {
      return { message: "Se o email existir, você receberá um link para redefinir sua senha." };
    }

    // Gerar token aleatório seguro
    const token = crypto.randomBytes(32).toString("hex");
    
    // Definir expiração de 1 hora
    const dataExpiracao = new Date();
    dataExpiracao.setHours(dataExpiracao.getHours() + 1);

    // Salvar token e data de expiração no usuário
    await usuario.update({
      token_reset_senha: token,
      data_expiracao_reset: dataExpiracao,
    });

    // Enviar email com o link de reset
    try {
      await emailService.enviarEmailResetSenha(usuario.email, usuario.nome, token);
    } catch (error) {
      // Se falhar o envio do email, limpar o token
      await usuario.update({
        token_reset_senha: null,
        data_expiracao_reset: null,
      });
      throw new AppError("Erro ao enviar email de redefinição de senha", 500);
    }

    return { message: "Se o email existir, você receberá um link para redefinir sua senha." };
  }

  async resetarSenha(token, novaSenha) {
    // Buscar usuário pelo token
    const usuario = await Usuario.findOne({
      where: { token_reset_senha: token },
    });

    if (!usuario) {
      throw new AppError("Token inválido ou expirado", 400);
    }

    // Verificar se o token não expirou
    const agora = new Date();
    if (!usuario.data_expiracao_reset || usuario.data_expiracao_reset < agora) {
      // Limpar token expirado
      await usuario.update({
        token_reset_senha: null,
        data_expiracao_reset: null,
      });
      throw new AppError("Token inválido ou expirado", 400);
    }

    // Atualizar senha e limpar token
    await usuario.update({
      senha: novaSenha,
      token_reset_senha: null,
      data_expiracao_reset: null,
    });

    return { message: "Senha redefinida com sucesso" };
  }
}

module.exports = new AuthService();
