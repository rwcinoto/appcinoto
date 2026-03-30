"use strict";

const { validationResult } = require("express-validator");
const rankingSenhaService = require("../services/rankingSenhaService");

class RankingSenhaController {
  /**
   * Obtém ranking de senha (global ou por conjunto).
   *
   * Query params: digitos, tamanho, repeticao, conjunto_id?
   */
  async obterRanking(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { digitos, tamanho, repeticao, conjunto_id } = req.query;

      if (digitos == null || tamanho == null || repeticao == null) {
        return res.status(400).json({
          message: "Filtros obrigatórios: digitos, tamanho, repeticao",
        });
      }

      const digitosNum = parseInt(digitos);
      const tamanhoNum = parseInt(tamanho);
      const repeticaoNum = parseInt(repeticao);

      if (Number.isNaN(digitosNum) || Number.isNaN(tamanhoNum)) {
        return res.status(400).json({
          message: "digitos e tamanho devem ser números válidos",
        });
      }

      const usuario = req.usuario;
      const conjuntoId = conjunto_id ? parseInt(conjunto_id) : null;
      if (
        conjunto_id != null &&
        (Number.isNaN(conjuntoId) || conjuntoId < 1)
      ) {
        return res.status(400).json({
          message: "conjunto_id deve ser um número válido",
        });
      }

      const filtros = {
        digitos: digitosNum,
        tamanho: tamanhoNum,
        repeticao: repeticaoNum,
        conjunto_id: conjuntoId,
      };

      const resultado = await rankingSenhaService.obterRanking(
        filtros,
        usuario.id,
        usuario.tipo
      );

      return res.json({
        ranking: resultado.ranking,
        posicaoUsuario: resultado.posicaoUsuario,
        totalParticipantes: resultado.totalParticipantes,
        filtros: {
          digitos: digitosNum,
          tamanho: tamanhoNum,
          repeticao: repeticaoNum,
        },
      });
    } catch (error) {
      console.error("Erro ao obter ranking de senha:", error);

      if (
        error.message ===
          "Filtros obrigatórios: digitos, tamanho, repeticao" ||
        error.message === "Conjunto não encontrado" ||
        error.message === "Conjunto inativo" ||
        error.message ===
          "Usuário não pertence ao conjunto ou convite não foi aceito"
      ) {
        return res.status(404).json({ message: error.message });
      }

      return res.status(500).json({
        message: "Erro ao obter ranking de senha",
        error: error.message,
      });
    }
  }
}

module.exports = new RankingSenhaController();
