const { validationResult } = require("express-validator");
const { AppError, formatValidationErrors } = require("../utils/errors");
const { Usuario, Plano, Operacao, Limite, Sistema } = require("../models");
const { Op } = require("sequelize");

class UsuarioController {
  /**
   * Converte uma string de data no formato YYYY-MM-DD para Date com horário 12:00 (meio-dia)
   * Isso evita problemas de timezone ao salvar apenas a data
   * @param {string} dataStr - Data no formato YYYY-MM-DD
   * @returns {Date|null} - Date com horário 12:00 UTC-3 ou null se dataStr for vazia/null
   */
  converterDataVencimento(dataStr) {
    if (!dataStr || dataStr === "") {
      return null;
    }

    // Se já for uma Date, retornar como está
    if (dataStr instanceof Date) {
      return dataStr;
    }

    // Se for string no formato YYYY-MM-DD, converter para Date com horário 12:00 UTC-3
    if (typeof dataStr === "string" && dataStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [ano, mes, dia] = dataStr.split("-").map(Number);
      // Criar data com horário 12:00 UTC-3 (15:00 UTC) para garantir que seja salva corretamente
      return new Date(Date.UTC(ano, mes - 1, dia, 15, 0, 0));
    }

    // Se não for nenhum dos formatos acima, tentar converter normalmente
    return new Date(dataStr);
  }
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
        attributes: ["id", "nome", "id_plano"],
        include: [{ association: "plano" }],
      });

      if (!usuario) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      return res.json({
        id: usuario.id,
        nome: usuario.nome,
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

      const { email, senha, nome, tipo, id_plano, ativo, data_vencimento_plano } = req.body;

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
      const dadosCriacao = {
        email,
        senha,
        nome,
        tipo: tipoUsuario,
        id_plano: idPlanoUsuario,
        ativo: ativo !== undefined ? ativo : true,
        ranking_global: true, // Padrão: true
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      };

      // Adicionar data_vencimento_plano apenas se for admin e se foi fornecida
      if (req.usuario.tipo === "admin" && data_vencimento_plano !== undefined) {
        dadosCriacao.data_vencimento_plano = this.converterDataVencimento(data_vencimento_plano);
      }

      const usuario = await Usuario.create(dadosCriacao);

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
        ? ["email", "senha", "nome", "tipo", "id_plano", "data_vencimento_plano", "ativo", "operacao_id", "limite_id", "sistema_id", "ranking_global"]
        : isProfe
        ? ["email", "senha", "nome", "ativo", "operacao_id", "limite_id", "sistema_id", "ranking_global"] // Profe não pode alterar tipo nem plano
        : ["email", "senha", "nome", "operacao_id", "limite_id", "sistema_id", "ranking_global"];

      const dadosAtualizacao = {};

      for (const campo of camposPermitidos) {
        if (req.body[campo] !== undefined) {
          // Converter data_vencimento_plano para Date com horário 12:00
          if (campo === "data_vencimento_plano") {
            dadosAtualizacao[campo] = this.converterDataVencimento(req.body[campo]);
          } else {
            dadosAtualizacao[campo] = req.body[campo];
          }
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

      // Carregar plano do usuário para validação
      const planoUsuario = await Plano.findByPk(usuario.id_plano);
      if (!planoUsuario) {
        return res.status(400).json({ message: "Plano do usuário não encontrado" });
      }

      // Validar que operacao_id pertence ao plano do usuário (se fornecido)
      if (dadosAtualizacao.operacao_id !== undefined) {
        if (dadosAtualizacao.operacao_id === null) {
          // Permitir null (remover preferência)
          dadosAtualizacao.operacao_id = null;
        } else {
          // Buscar planos disponíveis baseado na hierarquia
          const planosDisponiveis = await Plano.findAll({
            where: {
              ordem: {
                [Op.lte]: planoUsuario.ordem,
              },
            },
            attributes: ["id"],
          });
          const idsPlanos = planosDisponiveis.map((p) => p.id);

          const operacao = await Operacao.findOne({
            where: {
              id: dadosAtualizacao.operacao_id,
              id_plano: { [Op.in]: idsPlanos },
            },
          });

          if (!operacao) {
            return res.status(400).json({
              message: "Operação não encontrada ou não disponível para seu plano",
            });
          }
        }
      }

      // Validar que limite_id pertence ao plano do usuário (se fornecido)
      if (dadosAtualizacao.limite_id !== undefined) {
        if (dadosAtualizacao.limite_id === null) {
          // Permitir null (remover preferência)
          dadosAtualizacao.limite_id = null;
        } else {
          // Buscar planos disponíveis baseado na hierarquia
          const planosDisponiveis = await Plano.findAll({
            where: {
              ordem: {
                [Op.lte]: planoUsuario.ordem,
              },
            },
            attributes: ["id"],
          });
          const idsPlanos = planosDisponiveis.map((p) => p.id);

          const limite = await Limite.findOne({
            where: {
              id: dadosAtualizacao.limite_id,
              id_plano: { [Op.in]: idsPlanos },
            },
          });

          if (!limite) {
            return res.status(400).json({
              message: "Limite não encontrado ou não disponível para seu plano",
            });
          }
        }
      }

      // Validar que sistema_id pertence ao plano do usuário (se fornecido)
      if (dadosAtualizacao.sistema_id !== undefined) {
        if (dadosAtualizacao.sistema_id === null) {
          // Permitir null (remover preferência)
          dadosAtualizacao.sistema_id = null;
        } else {
          // Buscar planos disponíveis baseado na hierarquia
          const planosDisponiveis = await Plano.findAll({
            where: {
              ordem: {
                [Op.lte]: planoUsuario.ordem,
              },
            },
            attributes: ["id"],
          });
          const idsPlanos = planosDisponiveis.map((p) => p.id);

          const sistema = await Sistema.findOne({
            where: {
              id: dadosAtualizacao.sistema_id,
              id_plano: { [Op.in]: idsPlanos },
            },
          });

          if (!sistema) {
            return res.status(400).json({
              message: "Sistema não encontrado ou não disponível para seu plano",
            });
          }
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
