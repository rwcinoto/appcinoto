const { validationResult } = require("express-validator");
const { Plano, Usuario } = require("../models");
const { Op } = require("sequelize");

class PlanoController {
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const planos = await Plano.findAll({
        order: [["ordem", "ASC"]],
      });

      return res.json(planos);
    } catch (error) {
      console.error("Erro ao listar planos:", error);
      return res.status(500).json({
        message: "Erro ao listar planos",
        error: error.message,
      });
    }
  }

  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      const plano = await Plano.findByPk(id);

      if (!plano) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      return res.json(plano);
    } catch (error) {
      console.error("Erro ao obter plano:", error);
      return res.status(500).json({
        message: "Erro ao obter plano",
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

      const { nome, descricao, ordem, conjuntos_criar, conjuntos_participar } =
        req.body;

      // Validar ordem única
      const planoComOrdem = await Plano.findOne({ where: { ordem } });
      if (planoComOrdem) {
        return res.status(400).json({
          message: "Já existe um plano com esta ordem",
        });
      }

      // Criar plano
      const plano = await Plano.create({
        nome,
        descricao: descricao || null,
        ordem,
        conjuntos_criar: conjuntos_criar || 0,
        conjuntos_participar: conjuntos_participar || 0,
        criado_por: req.usuario.id,
        atualizado_por: req.usuario.id,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      return res.status(201).json(plano);
    } catch (error) {
      console.error("Erro ao criar plano:", error);
      return res.status(500).json({
        message: "Erro ao criar plano",
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
      const plano = await Plano.findByPk(id);

      if (!plano) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      const { nome, descricao, ordem, conjuntos_criar, conjuntos_participar } =
        req.body;

      // Validar ordem única (se alterada e diferente da atual)
      if (ordem !== undefined && ordem !== plano.ordem) {
        const planoComOrdem = await Plano.findOne({ where: { ordem } });
        if (planoComOrdem) {
          return res.status(400).json({
            message: "Já existe um plano com esta ordem",
          });
        }
      }

      // Atualizar plano
      const dadosAtualizacao = {};
      if (nome !== undefined) dadosAtualizacao.nome = nome;
      if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
      if (ordem !== undefined) dadosAtualizacao.ordem = ordem;
      if (conjuntos_criar !== undefined)
        dadosAtualizacao.conjuntos_criar = conjuntos_criar;
      if (conjuntos_participar !== undefined)
        dadosAtualizacao.conjuntos_participar = conjuntos_participar;

      dadosAtualizacao.atualizado_por = req.usuario.id;
      dadosAtualizacao.atualizado_em = new Date();

      await plano.update(dadosAtualizacao);

      return res.json(plano);
    } catch (error) {
      console.error("Erro ao atualizar plano:", error);
      return res.status(500).json({
        message: "Erro ao atualizar plano",
        error: error.message,
      });
    }
  }

  async excluir(req, res) {
    try {
      const id = parseInt(req.params.id);
      const plano = await Plano.findByPk(id);

      if (!plano) {
        return res.status(404).json({ message: "Plano não encontrado" });
      }

      // Verificar se há usuários usando este plano
      const usuariosComPlano = await Usuario.count({
        where: { id_plano: id },
      });

      if (usuariosComPlano > 0) {
        return res.status(400).json({
          message: `Não é possível excluir o plano. Existem ${usuariosComPlano} usuário(s) utilizando este plano.`,
        });
      }

      // Excluir plano (exclusão física, já que não há campo ativo)
      await plano.destroy();

      return res.json({ message: "Plano excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir plano:", error);
      return res.status(500).json({
        message: "Erro ao excluir plano",
        error: error.message,
      });
    }
  }
}

module.exports = new PlanoController();
