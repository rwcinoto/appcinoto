const { validationResult } = require("express-validator");
const { Sistema, Plano } = require("../models");

class SistemaController {
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Listar sistemas baseado no plano do usuário
      const idPlano = req.usuario.id_plano;

      const sistemas = await Sistema.findAll({
        where: { id_plano: idPlano },
        include: [{ association: "plano" }],
        order: [["tipo", "ASC"]],
      });

      return res.json(sistemas);
    } catch (error) {
      console.error("Erro ao listar sistemas:", error);
      return res.status(500).json({
        message: "Erro ao listar sistemas",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      const sistema = await Sistema.findByPk(id, {
        include: [{ association: "plano" }],
      });

      if (!sistema) {
        return res.status(404).json({ message: "Sistema não encontrado" });
      }

      // Verificar se o sistema pertence ao plano do usuário
      if (
        req.usuario.tipo !== "admin" &&
        sistema.id_plano !== req.usuario.id_plano
      ) {
        return res.status(403).json({
          message:
            "Acesso negado. Este sistema não está disponível no seu plano.",
        });
      }

      return res.json(sistema);
    } catch (error) {
      console.error("Erro ao obter sistema:", error);
      return res.status(500).json({
        message: "Erro ao obter sistema",
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

      const { descricao, tipo, id_plano } = req.body;

      // Validar plano existe
      const plano = await Plano.findByPk(id_plano);
      if (!plano) {
        return res.status(400).json({ message: "Plano não encontrado" });
      }

      const sistema = await Sistema.create({
        descricao: descricao || null,
        tipo,
        id_plano,
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      const sistemaCriado = await Sistema.findByPk(sistema.id, {
        include: [{ association: "plano" }],
      });

      return res.status(201).json(sistemaCriado);
    } catch (error) {
      console.error("Erro ao criar sistema:", error);
      return res.status(500).json({
        message: "Erro ao criar sistema",
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
      const sistema = await Sistema.findByPk(id);

      if (!sistema) {
        return res.status(404).json({ message: "Sistema não encontrado" });
      }

      const { descricao, tipo, id_plano } = req.body;

      // Validar plano existe (se alterado)
      if (id_plano !== undefined) {
        const plano = await Plano.findByPk(id_plano);
        if (!plano) {
          return res.status(400).json({ message: "Plano não encontrado" });
        }
      }

      const dadosAtualizacao = {};
      if (descricao !== undefined)
        dadosAtualizacao.descricao = descricao || null;
      if (tipo !== undefined) dadosAtualizacao.tipo = tipo;
      if (id_plano !== undefined) dadosAtualizacao.id_plano = id_plano;

      dadosAtualizacao.atualizado_por = req.usuario.id;
      dadosAtualizacao.atualizado_em = new Date();

      await sistema.update(dadosAtualizacao);

      const sistemaAtualizado = await Sistema.findByPk(id, {
        include: [{ association: "plano" }],
      });

      return res.json(sistemaAtualizado);
    } catch (error) {
      console.error("Erro ao atualizar sistema:", error);
      return res.status(500).json({
        message: "Erro ao atualizar sistema",
        error: error.message,
      });
    }
  }

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);
      const sistema = await Sistema.findByPk(id);

      if (!sistema) {
        return res.status(404).json({ message: "Sistema não encontrado" });
      }

      // Excluir sistema (exclusão física)
      await sistema.destroy();

      return res.json({ message: "Sistema excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir sistema:", error);
      return res.status(500).json({
        message: "Erro ao excluir sistema",
        error: error.message,
      });
    }
  }
}

module.exports = new SistemaController();
