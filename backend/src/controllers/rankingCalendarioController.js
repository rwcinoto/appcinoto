"use strict";

const { validationResult } = require("express-validator");
const rankingCalendarioService = require("../services/rankingCalendarioService");
const { Limite } = require("../models");

class RankingCalendarioController {
  /**
   * Obtém ranking de calendário (global).
   * Filtros via query params:
   * - tipo: "data_geral" | "mes" | "ano" | "seculo" | "data_2021"
   * - limite_id: número
   */
  async obterRanking(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { tipo, limite_id } = req.query;

      if (!tipo || !limite_id) {
        return res.status(400).json({
          message: "Filtros obrigatórios: tipo, limite_id",
        });
      }

      const limiteIdNum = parseInt(limite_id);
      if (Number.isNaN(limiteIdNum)) {
        return res.status(400).json({
          message: "limite_id deve ser um número válido",
        });
      }

      const usuario = req.usuario;

      const filtros = {
        tipo: String(tipo),
        id_limite: limiteIdNum,
      };

      const resultado = await rankingCalendarioService.obterRanking(
        filtros,
        usuario.id
      );

      // Buscar informações do limite para incluir na resposta
      const limite = await Limite.findByPk(limiteIdNum, {
        attributes: ["id", "descricao", "tempo"],
      });

      return res.json({
        ranking: resultado.ranking,
        posicaoUsuario: resultado.posicaoUsuario,
        totalParticipantes: resultado.totalParticipantes,
        filtros: {
          tipo: filtros.tipo,
          limite: limite
            ? {
                id: limite.id,
                descricao: limite.descricao,
                tempo: limite.tempo,
              }
            : null,
        },
      });
    } catch (error) {
      console.error("Erro ao obter ranking de calendário:", error);

      if (
        error.message === "Filtros obrigatórios: tipo, id_limite" ||
        error.message === "Limite não encontrado"
      ) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Erro ao obter ranking de calendário",
        error: error.message,
      });
    }
  }
}

module.exports = new RankingCalendarioController();

