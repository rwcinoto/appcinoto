const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { Operacao, Plano } = require("../models");

class OperacaoController {
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Buscar a ordem do plano do usuário (admin sempre está no maior plano e verá tudo automaticamente)
      const ordemPlanoUsuario = req.usuario.plano?.ordem;
      if (!ordemPlanoUsuario) {
        return res
          .status(400)
          .json({ message: "Plano do usuário não encontrado" });
      }

      // Buscar IDs de planos com ordem <= ordem do plano do usuário
      const planosDisponiveis = await Plano.findAll({
        where: {
          ordem: {
            [Op.lte]: ordemPlanoUsuario,
          },
        },
        attributes: ["id"],
      });

      const idsPlanos = planosDisponiveis.map((p) => p.id);

      const operacoes = await Operacao.findAll({
        where: {
          id_plano: {
            [Op.in]: idsPlanos,
          },
        },
        include: [{ association: "plano" }],
        order: [["nome", "ASC"]],
      });

      return res.json(operacoes);
    } catch (error) {
      console.error("Erro ao listar operações:", error);
      return res.status(500).json({
        message: "Erro ao listar operações",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      const operacao = await Operacao.findByPk(id, {
        include: [{ association: "plano" }],
      });

      if (!operacao) {
        return res.status(404).json({ message: "Operação não encontrada" });
      }

      // Verificar se a operação está disponível para o plano do usuário (baseado na hierarquia)
      const ordemPlanoUsuario = req.usuario.plano?.ordem;
      const ordemPlanoOperacao = operacao.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoOperacao ||
        ordemPlanoOperacao > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message:
            "Acesso negado. Esta operação não está disponível no seu plano.",
        });
      }

      return res.json(operacao);
    } catch (error) {
      console.error("Erro ao obter operação:", error);
      return res.status(500).json({
        message: "Erro ao obter operação",
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

      const { nome, descricao, tipo, min_parcela_1, max_parcela_1, id_plano } =
        req.body;

      // Usar let para variáveis que podem ser modificadas (para tipo raiz)
      let { min_parcela_2, max_parcela_2, min_parcela_3, max_parcela_3 } =
        req.body;

      // Validar plano existe
      const plano = await Plano.findByPk(id_plano);
      if (!plano) {
        return res.status(400).json({ message: "Plano não encontrado" });
      }

      // Validações específicas por tipo
      if (tipo === "raiz") {
        // Raiz só precisa de parcela_1
        // Se os campos foram enviados (não são undefined), devem ser null
        if (
          (min_parcela_2 !== undefined && min_parcela_2 !== null) ||
          (max_parcela_2 !== undefined && max_parcela_2 !== null) ||
          (min_parcela_3 !== undefined && min_parcela_3 !== null) ||
          (max_parcela_3 !== undefined && max_parcela_3 !== null)
        ) {
          return res.status(400).json({
            message: "Operação do tipo 'raiz' só utiliza parcela_1",
          });
        }
        // Garantir que sejam null para raiz
        min_parcela_2 = null;
        max_parcela_2 = null;
        min_parcela_3 = null;
        max_parcela_3 = null;
      }

      // Validar min <= max para cada parcela
      if (min_parcela_1 > max_parcela_1) {
        return res.status(400).json({
          message: "min_parcela_1 deve ser menor ou igual a max_parcela_1",
        });
      }
      if (
        min_parcela_2 !== null &&
        max_parcela_2 !== null &&
        min_parcela_2 > max_parcela_2
      ) {
        return res.status(400).json({
          message: "min_parcela_2 deve ser menor ou igual a max_parcela_2",
        });
      }
      if (
        min_parcela_3 !== null &&
        max_parcela_3 !== null &&
        min_parcela_3 > max_parcela_3
      ) {
        return res.status(400).json({
          message: "min_parcela_3 deve ser menor ou igual a max_parcela_3",
        });
      }

      const operacao = await Operacao.create({
        nome,
        descricao: descricao || null,
        tipo,
        min_parcela_1,
        max_parcela_1,
        min_parcela_2: min_parcela_2 !== undefined ? min_parcela_2 : null,
        max_parcela_2: max_parcela_2 !== undefined ? max_parcela_2 : null,
        min_parcela_3: min_parcela_3 !== undefined ? min_parcela_3 : null,
        max_parcela_3: max_parcela_3 !== undefined ? max_parcela_3 : null,
        id_plano,
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      const operacaoCriada = await Operacao.findByPk(operacao.id, {
        include: [{ association: "plano" }],
      });

      return res.status(201).json(operacaoCriada);
    } catch (error) {
      console.error("Erro ao criar operação:", error);
      return res.status(500).json({
        message: "Erro ao criar operação",
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
      const operacao = await Operacao.findByPk(id);

      if (!operacao) {
        return res.status(404).json({ message: "Operação não encontrada" });
      }

      const { nome, descricao, tipo, min_parcela_1, max_parcela_1, id_plano } =
        req.body;

      // Usar let para variáveis que podem ser modificadas (para tipo raiz)
      let { min_parcela_2, max_parcela_2, min_parcela_3, max_parcela_3 } =
        req.body;

      // Validar plano existe (se alterado)
      if (id_plano !== undefined) {
        const plano = await Plano.findByPk(id_plano);
        if (!plano) {
          return res.status(400).json({ message: "Plano não encontrado" });
        }
      }

      // Validações específicas por tipo
      const tipoAtual = tipo !== undefined ? tipo : operacao.tipo;
      if (tipoAtual === "raiz") {
        // Se os campos foram enviados e não são null, é erro
        if (
          (min_parcela_2 !== undefined && min_parcela_2 !== null) ||
          (max_parcela_2 !== undefined && max_parcela_2 !== null) ||
          (min_parcela_3 !== undefined && min_parcela_3 !== null) ||
          (max_parcela_3 !== undefined && max_parcela_3 !== null)
        ) {
          return res.status(400).json({
            message: "Operação do tipo 'raiz' só utiliza parcela_1",
          });
        }
        // Garantir que sejam null para raiz
        if (
          tipo !== undefined ||
          min_parcela_2 !== undefined ||
          max_parcela_2 !== undefined
        ) {
          min_parcela_2 = null;
          max_parcela_2 = null;
        }
        if (
          tipo !== undefined ||
          min_parcela_3 !== undefined ||
          max_parcela_3 !== undefined
        ) {
          min_parcela_3 = null;
          max_parcela_3 = null;
        }
      }

      // Validar min <= max
      const min1 =
        min_parcela_1 !== undefined ? min_parcela_1 : operacao.min_parcela_1;
      const max1 =
        max_parcela_1 !== undefined ? max_parcela_1 : operacao.max_parcela_1;
      if (min1 > max1) {
        return res.status(400).json({
          message: "min_parcela_1 deve ser menor ou igual a max_parcela_1",
        });
      }

      if (min_parcela_2 !== undefined && max_parcela_2 !== undefined) {
        if (
          min_parcela_2 !== null &&
          max_parcela_2 !== null &&
          min_parcela_2 > max_parcela_2
        ) {
          return res.status(400).json({
            message: "min_parcela_2 deve ser menor ou igual a max_parcela_2",
          });
        }
      }

      if (min_parcela_3 !== undefined && max_parcela_3 !== undefined) {
        if (
          min_parcela_3 !== null &&
          max_parcela_3 !== null &&
          min_parcela_3 > max_parcela_3
        ) {
          return res.status(400).json({
            message: "min_parcela_3 deve ser menor ou igual a max_parcela_3",
          });
        }
      }

      const dadosAtualizacao = {};
      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (descricao !== undefined)
        dadosAtualizacao.descricao = descricao || null;
      if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
      if (min_parcela_1 !== undefined)
        dadosAtualizacao.min_parcela_1 = min_parcela_1;
      if (max_parcela_1 !== undefined)
        dadosAtualizacao.max_parcela_1 = max_parcela_1;
      if (min_parcela_2 !== undefined)
        dadosAtualizacao.min_parcela_2 = min_parcela_2;
      if (max_parcela_2 !== undefined)
        dadosAtualizacao.max_parcela_2 = max_parcela_2;
      if (min_parcela_3 !== undefined)
        dadosAtualizacao.min_parcela_3 = min_parcela_3;
      if (max_parcela_3 !== undefined)
        dadosAtualizacao.max_parcela_3 = max_parcela_3;
      if (id_plano !== undefined) dadosAtualizacao.id_plano = id_plano;

      dadosAtualizacao.atualizado_por = req.usuario.id;
      dadosAtualizacao.atualizado_em = new Date();

      await operacao.update(dadosAtualizacao);

      const operacaoAtualizada = await Operacao.findByPk(id, {
        include: [{ association: "plano" }],
      });

      return res.json(operacaoAtualizada);
    } catch (error) {
      console.error("Erro ao atualizar operação:", error);
      return res.status(500).json({
        message: "Erro ao atualizar operação",
        error: error.message,
      });
    }
  }

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);
      const operacao = await Operacao.findByPk(id);

      if (!operacao) {
        return res.status(404).json({ message: "Operação não encontrada" });
      }

      // Excluir operação (exclusão física)
      await operacao.destroy();

      return res.json({ message: "Operação excluída com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir operação:", error);
      return res.status(500).json({
        message: "Erro ao excluir operação",
        error: error.message,
      });
    }
  }
}

module.exports = new OperacaoController();
