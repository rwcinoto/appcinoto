"use strict";

const { validationResult } = require("express-validator");
const rankingService = require("../services/rankingService");
const { Operacao, Limite, Sistema } = require("../models");

class RankingController {
  /**
   * Obtém ranking unificado (global ou por conjunto)
   * Filtros via query params: operacao_id, limite_id, sistema_id, conjunto_id (opcional)
   */
  async obterRanking(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Obter filtros da query string
      const { operacao_id, limite_id, sistema_id, conjunto_id } = req.query;

      // Validar filtros obrigatórios
      if (!operacao_id || !limite_id || !sistema_id) {
        return res.status(400).json({
          message:
            "Filtros obrigatórios: operacao_id, limite_id, sistema_id",
        });
      }

      // Converter para números
      const operacaoId = parseInt(operacao_id);
      const limiteId = parseInt(limite_id);
      const sistemaId = parseInt(sistema_id);
      const conjuntoId = conjunto_id ? parseInt(conjunto_id) : null;

      // Validar que são números válidos
      if (isNaN(operacaoId) || isNaN(limiteId) || isNaN(sistemaId)) {
        return res.status(400).json({
          message:
            "operacao_id, limite_id e sistema_id devem ser números válidos",
        });
      }

      if (conjuntoId !== null && isNaN(conjuntoId)) {
        return res.status(400).json({
          message: "conjunto_id deve ser um número válido",
        });
      }

      const usuario = req.usuario;

      // O service valida existência dos recursos
      // Não validamos acesso aqui porque:
      // 1. Frontend já filtra opções disponíveis
      // 2. Se usuário não tem acesso, não terá recordes (ranking vazio)
      // 3. Não há risco de segurança em consultar ranking

      // Preparar filtros para o service
      const filtros = {
        operacao_id: operacaoId,
        limite_id: limiteId,
        sistema_id: sistemaId,
      };

      // Adicionar conjunto_id se fornecido
      if (conjuntoId !== null) {
        filtros.conjunto_id = conjuntoId;
      }

      // Chamar service para obter ranking
      const resultado = await rankingService.obterRanking(
        filtros,
        usuario.id,
        usuario.tipo
      );

      // Formatar resposta
      // Buscar informações dos recursos para incluir na resposta
      // O service já validou que existem
      const [operacao, limite, sistema] = await Promise.all([
        Operacao.findByPk(operacaoId, {
          attributes: ["id", "nome"],
        }),
        Limite.findByPk(limiteId, {
          attributes: ["id", "descricao", "tempo"],
        }),
        Sistema.findByPk(sistemaId, {
          attributes: ["id", "tipo"],
        }),
      ]);

      return res.json({
        ranking: resultado.ranking,
        posicaoUsuario: resultado.posicaoUsuario,
        totalParticipantes: resultado.totalParticipantes,
        filtros: {
          operacao: operacao
            ? {
                id: operacao.id,
                nome: operacao.nome,
              }
            : null,
          limite: limite
            ? {
                id: limite.id,
                descricao: limite.descricao,
                tempo: limite.tempo,
              }
            : null,
          sistema: sistema
            ? {
                id: sistema.id,
                tipo: sistema.tipo,
              }
            : null,
          conjunto_id: conjuntoId,
        },
      });
    } catch (error) {
      console.error("Erro ao obter ranking:", error);

      // Tratar erros específicos do service
      if (
        error.message === "Filtros obrigatórios: operacao_id, limite_id, sistema_id" ||
        error.message === "Operação não encontrada" ||
        error.message === "Limite não encontrado" ||
        error.message === "Sistema não encontrado"
      ) {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message === "Conjunto não encontrado" ||
        error.message === "Conjunto inativo"
      ) {
        return res.status(404).json({ message: error.message });
      }

      if (
        error.message ===
        "Usuário não pertence ao conjunto ou convite não foi aceito"
      ) {
        return res.status(403).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Erro ao obter ranking",
        error: error.message,
      });
    }
  }

  /**
   * Obtém apenas a posição do usuário no ranking global
   * Filtros via query params: operacao_id, limite_id, sistema_id
   */
  async obterPosicao(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      // Obter filtros da query string
      const { operacao_id, limite_id, sistema_id } = req.query;

      // Validar filtros obrigatórios
      if (!operacao_id || !limite_id || !sistema_id) {
        return res.status(400).json({
          message:
            "Filtros obrigatórios: operacao_id, limite_id, sistema_id",
        });
      }

      // Converter para números
      const operacaoId = parseInt(operacao_id);
      const limiteId = parseInt(limite_id);
      const sistemaId = parseInt(sistema_id);

      // Validar que são números válidos
      if (isNaN(operacaoId) || isNaN(limiteId) || isNaN(sistemaId)) {
        return res.status(400).json({
          message:
            "operacao_id, limite_id e sistema_id devem ser números válidos",
        });
      }

      const usuario = req.usuario;

      // Preparar filtros para o service
      const filtros = {
        operacao_id: operacaoId,
        limite_id: limiteId,
        sistema_id: sistemaId,
      };

      // Determinar qual usuário buscar posição (padrão: usuário logado)
      let usuarioIdParaBuscar = usuario.id;
      if (req.query.usuario_id) {
        const usuarioIdQuery = parseInt(req.query.usuario_id);
        if (isNaN(usuarioIdQuery)) {
          return res.status(400).json({
            message: "usuario_id deve ser um número válido",
          });
        }
        // Permitir que qualquer usuário veja a posição de outro usuário
        usuarioIdParaBuscar = usuarioIdQuery;
      }

      // Chamar service para obter posição
      const posicao = await rankingService.obterPosicaoUsuario(
        filtros,
        usuarioIdParaBuscar,
        usuario.tipo
      );

      return res.json({ posicao });
    } catch (error) {
      console.error("Erro ao obter posição:", error);

      // Tratar erros específicos do service
      if (
        error.message === "Filtros obrigatórios: operacao_id, limite_id, sistema_id" ||
        error.message === "Operação não encontrada" ||
        error.message === "Limite não encontrado" ||
        error.message === "Sistema não encontrado"
      ) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Erro ao obter posição",
        error: error.message,
      });
    }
  }
}

module.exports = new RankingController();

