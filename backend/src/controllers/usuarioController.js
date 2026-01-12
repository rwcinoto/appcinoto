const { validationResult } = require("express-validator");
const { AppError, formatValidationErrors } = require("../utils/errors");
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

      // Se for profe, só pode ver usuários criados por ele
      if (req.usuario.tipo === "profe") {
        where.criado_por = req.usuario.id;
      }

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
        order: [["nome", "ASC"]],
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

  /**
   * Obtém apenas o nome do usuário (público para usuários autenticados)
   * Também retorna o plano para permitir filtrar dados baseados no plano do usuário visualizado
   */
  async obterNome(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "ID deve ser um número válido",
        });
      }

      const usuario = await Usuario.findByPk(id, {
        attributes: ["id", "nome", "email", "id_plano"],
        include: [{ association: "plano" }],
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        plano: usuario.plano,
      });
    } catch (error) {
      console.error("Erro ao obter nome do usuário:", error);
      return res.status(500).json({
        message: "Erro ao obter nome do usuário",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      // Validar se o ID é um número válido
      if (isNaN(id) || id <= 0) {
        return res.status(400).json({
          message: "ID do usuário deve ser um número válido",
        });
      }

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

  async criar(req, res, next) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        const errorResponse = formatValidationErrors(erros.array());
        return res.status(errorResponse.statusCode).json({
          message: errorResponse.message,
          errors: errorResponse.errors,
        });
      }

      const { email, senha, nome, tipo, id_plano, ativo } = req.body;

      // Validar email único
      const usuarioExistente = await Usuario.findOne({ where: { email } });
      if (usuarioExistente) {
        return res.status(400).json({ message: "Email já está em uso" });
      }

      // Se for profe, sempre usar plano id=2 e tipo "comum"
      const idPlanoUsuario = req.usuario.tipo === "profe" ? 2 : id_plano;
      const tipoUsuario = req.usuario.tipo === "profe" ? "comum" : (tipo || "comum");

      // Validar plano existe
      const plano = await Plano.findByPk(idPlanoUsuario);
      if (!plano) {
        return res.status(400).json({ message: "Plano não encontrado" });
      }

      // Criar usuário (senha será hasheada automaticamente pelo hook do modelo)
      const usuario = await Usuario.create({
        email,
        senha,
        nome,
        tipo: tipoUsuario,
        id_plano: idPlanoUsuario,
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
      next(error);
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
      const isProfe = req.usuario.tipo === "profe";
      const isProprioUsuario = req.usuario.id === id;

      const usuario = await Usuario.findByPk(id);
      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Verifica se o usuário pode atualizar este perfil
      const podeAtualizar = isAdmin || isProprioUsuario || (isProfe && usuario.criado_por === req.usuario.id);
      
      if (!podeAtualizar) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode atualizar seu próprio perfil ou usuários criados por você.",
        });
      }

      // Campos que podem ser atualizados
      const camposPermitidos = isAdmin
        ? ["email", "senha", "nome", "tipo", "id_plano", "ativo"]
        : isProfe
        ? ["email", "senha", "nome", "ativo"] // Profe não pode alterar tipo nem plano
        : ["email", "senha", "nome"];

      const dadosAtualizacao = {};

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          dadosAtualizacao[campo] = req.body[campo];
        }
      }

      // Se for profe, garantir que não está tentando alterar o tipo nem o plano
      if (isProfe) {
        if (req.body.tipo !== undefined) {
          delete dadosAtualizacao.tipo;
        }
        if (req.body.id_plano !== undefined) {
          delete dadosAtualizacao.id_plano;
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

      // Se for profe, sempre usar plano id=2
      if (isProfe) {
        dadosAtualizacao.id_plano = 2;
      }

      // Validar plano existe (se for alterar)
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
      next(error);
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
