"use strict";

const { validationResult } = require("express-validator");
const recordeService = require("../services/recordeService");
const { Limite, Sistema, Operacao, Plano } = require("../models");

class RecordeController {
  /**
   * Lista recordes do usuário logado
   * Aceita filtros opcionais: operacao_id, tipo_operacao, limite_id, sistema_id, plano_id
   */
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Obter filtros opcionais da query string
      const filtros = {};

      if (req.query.operacao_id) {
        const operacaoId = parseInt(req.query.operacao_id);
        if (isNaN(operacaoId)) {
          return res.status(400).json({
            message: "operacao_id deve ser um número válido",
          });
        }

        // Validar que a operação existe
        const operacao = await Operacao.findByPk(operacaoId);
        if (!operacao) {
          return res.status(404).json({ message: "Operação não encontrada" });
        }

        filtros.operacao_id = operacaoId;
      }

      if (req.query.tipo_operacao) {
        // Validar tipos de operação válidos
        const tiposValidos = ["soma", "subtracao", "multiplicacao", "divisao", "raiz", "aleatorio", "conversao"];
        if (!tiposValidos.includes(req.query.tipo_operacao)) {
          return res.status(400).json({
            message: "tipo_operacao inválido",
          });
        }

        filtros.tipo_operacao = req.query.tipo_operacao;
      }

      if (req.query.limite_id) {
        const limiteId = parseInt(req.query.limite_id);
        if (isNaN(limiteId)) {
          return res.status(400).json({
            message: "limite_id deve ser um número válido",
          });
        }

        // Validar que o limite existe
        const limite = await Limite.findByPk(limiteId);
        if (!limite) {
          return res.status(404).json({ message: "Limite não encontrado" });
        }

        filtros.limite_id = limiteId;
      }

      if (req.query.sistema_id) {
        const sistemaId = parseInt(req.query.sistema_id);
        if (isNaN(sistemaId)) {
          return res.status(400).json({
            message: "sistema_id deve ser um número válido",
          });
        }

        // Validar que o sistema existe
        const sistema = await Sistema.findByPk(sistemaId);
        if (!sistema) {
          return res.status(404).json({ message: "Sistema não encontrado" });
        }

        filtros.sistema_id = sistemaId;
      }

      if (req.query.plano_id) {
        const planoId = parseInt(req.query.plano_id);
        if (isNaN(planoId)) {
          return res.status(400).json({
            message: "plano_id deve ser um número válido",
          });
        }

        // Validar que o plano existe
        const plano = await Plano.findByPk(planoId);
        if (!plano) {
          return res.status(404).json({ message: "Plano não encontrado" });
        }

        filtros.plano_id = planoId;
      }

      // Determinar qual usuário buscar recordes (padrão: usuário logado)
      let usuarioIdParaBuscar = req.usuario.id;
      if (req.query.usuario_id) {
        const usuarioIdQuery = parseInt(req.query.usuario_id);
        if (isNaN(usuarioIdQuery)) {
          return res.status(400).json({
            message: "usuario_id deve ser um número válido",
          });
        }
        // Permitir que qualquer usuário veja os recordes de outro usuário
        usuarioIdParaBuscar = usuarioIdQuery;
      }

      // Chamar service para listar recordes
      const recordes = await recordeService.listarRecordes(
        usuarioIdParaBuscar,
        filtros
      );

      // Formatar resposta
      const recordesFormatados = recordes.map((recorde) => ({
        id: recorde.id,
        id_usuario: recorde.id_usuario,
        id_operacao: recorde.id_operacao,
        id_limite: recorde.id_limite,
        id_sistema: recorde.id_sistema,
        total: recorde.total,
        quantidade: recorde.quantidade,
        criado_em: recorde.criado_em,
        atualizado_em: recorde.atualizado_em,
        operacao: recorde.operacao
          ? {
              id: recorde.operacao.id,
              nome: recorde.operacao.nome,
              descricao: recorde.operacao.descricao,
              tipo: recorde.operacao.tipo,
              ordem: recorde.operacao.ordem,
            }
          : null,
        limite: recorde.limite
          ? {
              id: recorde.limite.id,
              descricao: recorde.limite.descricao,
              tempo: recorde.limite.tempo,
            }
          : null,
        sistema: recorde.sistema
          ? {
              id: recorde.sistema.id,
              descricao: recorde.sistema.descricao,
              tipo: recorde.sistema.tipo,
            }
          : null,
      }));

      return res.json(recordesFormatados);
    } catch (error) {
      console.error("Erro ao listar recordes:", error);
      return res.status(500).json({
        message: "Erro ao listar recordes",
        error: error.message,
      });
    }
  }

  /**
   * Obtém um recorde específico por ID
   * Verifica que o recorde pertence ao usuário logado
   */
  async obter(req, res) {
    try {
      const id = parseInt(req.params.id);

      if (isNaN(id)) {
        return res.status(400).json({
          message: "ID do recorde deve ser um número válido",
        });
      }

      // Chamar service para obter recorde
      // O service já valida que o recorde pertence ao usuário
      const recorde = await recordeService.obterRecorde(id, req.usuario.id);

      // Formatar resposta
      const recordeFormatado = {
        id: recorde.id,
        id_usuario: recorde.id_usuario,
        id_operacao: recorde.id_operacao,
        id_limite: recorde.id_limite,
        id_sistema: recorde.id_sistema,
        total: recorde.total,
        quantidade: recorde.quantidade,
        criado_em: recorde.criado_em,
        atualizado_em: recorde.atualizado_em,
        criado_por: recorde.criado_por,
        atualizado_por: recorde.atualizado_por,
        operacao: recorde.operacao
          ? {
              id: recorde.operacao.id,
              nome: recorde.operacao.nome,
              descricao: recorde.operacao.descricao,
              tipo: recorde.operacao.tipo,
              ordem: recorde.operacao.ordem,
            }
          : null,
        limite: recorde.limite
          ? {
              id: recorde.limite.id,
              descricao: recorde.limite.descricao,
              tempo: recorde.limite.tempo,
            }
          : null,
        sistema: recorde.sistema
          ? {
              id: recorde.sistema.id,
              descricao: recorde.sistema.descricao,
              tipo: recorde.sistema.tipo,
            }
          : null,
      };

      return res.json(recordeFormatado);
    } catch (error) {
      console.error("Erro ao obter recorde:", error);

      // Tratar erros específicos do service
      if (error.message === "Recorde não encontrado") {
        return res.status(404).json({ message: error.message });
      }

      if (error.message === "Recorde não pertence ao usuário") {
        return res.status(403).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Erro ao obter recorde",
        error: error.message,
      });
    }
  }
}

module.exports = new RecordeController();
