const { validationResult } = require("express-validator");
const { Usuario, Plano } = require("../models");
const { Op } = require("sequelize");

class UsuarioController {
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Paginação
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const offset = (page - 1) * limit;

      // Filtros
      const where = {};

      if (req.query.tipo) {
        where.tipo = req.query.tipo;
      }

      if (req.query.ativo !== undefined) {
        where.ativo = req.query.ativo === "true";
      }

      if (req.query.id_plano) {
        where.id_plano = parseInt(req.query.id_plano);
      }

      // Busca por nome ou email
      if (req.query.busca) {
        where[Op.or] = [
          { nome: { [Op.like]: `%${req.query.busca}%` } },
          { email: { [Op.like]: `%${req.query.busca}%` } },
        ];
      }

      const { count, rows } = await Usuario.findAndCountAll({
        where,
        limit,
        offset,
        attributes: { exclude: ["senha"] },
        include: [{ association: "plano" }],
        order: [["criado_em", "DESC"]],
      });

      return res.json({
        usuarios: rows,
        paginacao: {
          total: count,
          pagina: page,
          limite: limit,
          totalPaginas: Math.ceil(count / limit),
        },
      });
    } catch (error) {
      console.error("Erro ao listar usuários:", error);
      return res.status(500).json({
        message: "Erro ao listar usuários",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      // Verifica se o usuário pode acessar este perfil
      if (req.usuario.tipo !== "admin" && req.usuario.id !== id) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode ver seu próprio perfil.",
        });
      }

      const usuario = await Usuario.findByPk(id, {
        attributes: { exclude: ["senha"] },
        include: [{ association: "plano" }],
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json(usuario);
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
      return res.status(500).json({
        message: "Erro ao obter usuário",
        error: error.message,
      });
    }
  }

  async criar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { email, senha, nome, tipo, id_plano, ativo } = req.body;

      // Validar email único
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Validar plano existe
      const plano = await Plano.findByPk(id_plano);
      if (!plano) {
        return res.status(400).json({ message: "Plano não encontrado" });
      }

      // Criar usuário (senha será hasheada automaticamente pelo hook do modelo)
      const usuario = await Usuario.create({
        email,
        senha,
        nome,
        tipo: tipo || "comum",
        id_plano,
        ativo: ativo !== undefined ? ativo : true,
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      // Recarregar usuário com plano e sem senha
      const usuarioCriado = await Usuario.findByPk(usuario.id, {
        attributes: { exclude: ["senha"] },
        include: [{ association: "plano" }],
      });

      return res.status(201).json(usuarioCriado);
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return res.status(500).json({
        message: "Erro ao criar usuário",
        error: error.message,
      });
    }
  }

  async atualizar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const id = parseInt(req.params.id);
      const isAdmin = req.usuario.tipo === "admin";
      const isProprioUsuario = req.usuario.id === id;

      // Verifica se o usuário pode atualizar este perfil
      if (!isAdmin && !isProprioUsuario) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode atualizar seu próprio perfil.",
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Campos que podem ser atualizados
      const camposPermitidos = isAdmin
        ? ["email", "senha", "nome", "tipo", "id_plano", "ativo"]
        : ["email", "senha", "nome"];

      const dadosAtualizacao = {};

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          dadosAtualizacao[campo] = req.body[campo];
        }
      }

      // Validar email único (se alterado)
      if (dadosAtualizacao.email && dadosAtualizacao.email !== usuario.email) {
        const usuarioComEmail = await Usuario.findOne({
          where: { email: dadosAtualizacao.email },
        });
        if (usuarioComEmail) {
          return res.status(400).json({ message: "Email já está em uso" });
        }
      }

      // Validar plano existe (se admin alterar)
      if (dadosAtualizacao.id_plano) {
        const plano = await Plano.findByPk(dadosAtualizacao.id_plano);
        if (!plano) {
          return res.status(400).json({ message: "Plano não encontrado" });
        }
      }

      // Atualizar usuário (senha será hasheada automaticamente pelo hook do modelo)
      dadosAtualizacao.atualizado_por = req.usuario.id;
      dadosAtualizacao.atualizado_em = new Date();

      await usuario.update(dadosAtualizacao);

      // Recarregar usuário com plano e sem senha
      const usuarioAtualizado = await Usuario.findByPk(id, {
        attributes: { exclude: ["senha"] },
        include: [{ association: "plano" }],
      });

      return res.json(usuarioAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar usuário:", error);
      return res.status(500).json({
        message: "Erro ao atualizar usuário",
        error: error.message,
      });
    }
  }

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);

      // Não permitir excluir próprio usuário
      if (req.usuario.id === id) {
        return res.status(400).json({
          message: "Você não pode excluir seu próprio usuário",
        });
      }

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Exclusão lógica
      await usuario.update({
        ativo: false,
        atualizado_por: req.usuario.id,
        atualizado_em: new Date(),
      });

      return res.json({ message: "Usuário excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      return res.status(500).json({
        message: "Erro ao excluir usuário",
        error: error.message,
      });
    }
  }
}

module.exports = new UsuarioController();
