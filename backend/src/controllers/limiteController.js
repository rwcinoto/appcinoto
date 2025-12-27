const { validationResult } = require("express-validator");
const { Op } = require("sequelize");
const { Limite, Plano } = require("../models");

class LimiteController {
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

      const limites = await Limite.findAll({
        where: {
          id_plano: {
            [Op.in]: idsPlanos,
          },
        },
        include: [{ association: "plano" }],
        order: [["tempo", "ASC"]],
      });

      return res.json(limites);
    } catch (error) {
      console.error("Erro ao listar limites:", error);
      return res.status(500).json({
        message: "Erro ao listar limites",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      const limite = await Limite.findByPk(id, {
        include: [{ association: "plano" }],
      });

      if (!limite) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }

      // Verificar se o limite está disponível para o plano do usuário (baseado na hierarquia)
      const ordemPlanoUsuario = req.usuario.plano?.ordem;
      const ordemPlanoLimite = limite.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoLimite ||
        ordemPlanoLimite > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message:
            "Acesso negado. Este limite não está disponível no seu plano.",
        });
      }

      return res.json(limite);
    } catch (error) {
      console.error("Erro ao obter limite:", error);
      return res.status(500).json({
        message: "Erro ao obter limite",
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

      const { descricao, tempo, id_plano } = req.body;

      // Validar plano existe
      const plano = await Plano.findByPk(id_plano);
      if (!plano) {
        return res.status(400).json({ message: "Plano não encontrado" });
      }

      const limite = await Limite.create({
        descricao,
        tempo,
        id_plano,
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      const limiteCriado = await Limite.findByPk(limite.id, {
        include: [{ association: "plano" }],
      });

      return res.status(201).json(limiteCriado);
    } catch (error) {
      console.error("Erro ao criar limite:", error);
      return res.status(500).json({
        message: "Erro ao criar limite",
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
      const limite = await Limite.findByPk(id);

      if (!limite) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }

      const { descricao, tempo, id_plano } = req.body;

      // Validar plano existe (se alterado)
      if (id_plano !== undefined) {
        const plano = await Plano.findByPk(id_plano);
        if (!plano) {
          return res.status(400).json({ message: "Plano não encontrado" });
        }
      }

      const dadosAtualizacao = {};
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (tempo !== undefined) dadosAtualizacao.tempo = tempo;
      if (id_plano !== undefined) dadosAtualizacao.id_plano = id_plano;

      dadosAtualizacao.atualizado_por = req.usuario.id;
      dadosAtualizacao.atualizado_em = new Date();

      await limite.update(dadosAtualizacao);

      const limiteAtualizado = await Limite.findByPk(id, {
        include: [{ association: "plano" }],
      });

      return res.json(limiteAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar limite:", error);
      return res.status(500).json({
        message: "Erro ao atualizar limite",
        error: error.message,
      });
    }
  }

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);
      const limite = await Limite.findByPk(id);

      if (!limite) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }

      // Excluir limite (exclusão física)
      await limite.destroy();

      return res.json({ message: "Limite excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir limite:", error);
      return res.status(500).json({
        message: "Erro ao excluir limite",
        error: error.message,
      });
    }
  }
}

module.exports = new LimiteController();
