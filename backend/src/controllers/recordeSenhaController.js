"use strict";

const { validationResult } = require("express-validator");
const { Usuario, RecordeSenha } = require("../models");
const recordeSenhaService = require("../services/recordeSenhaService");

class RecordeSenhaController {
  /**
   * Lista recordes de senha de um usuário.
   *
   * Query params: digitos?, tamanho?, repeticao?, usuario_id?
   */
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      let usuarioIdParaBuscar = req.usuario.id;
      if (req.query.usuario_id) {
        const usuarioIdQuery = parseInt(req.query.usuario_id, 10);
        if (Number.isNaN(usuarioIdQuery)) {
          return res.status(400).json({
            message: "usuario_id deve ser um número válido",
          });
        }
        usuarioIdParaBuscar = usuarioIdQuery;
      }

      if (usuarioIdParaBuscar === 0) {
        return res.json([]);
      }

      const usuarioAlvo = await Usuario.findByPk(usuarioIdParaBuscar, {
        attributes: ["id"],
      });

      if (!usuarioAlvo) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const where = { id_usuario: usuarioIdParaBuscar };

      if (req.query.digitos) {
        const digitosNum = parseInt(req.query.digitos, 10);
        if (!Number.isNaN(digitosNum)) {
          where.digitos = digitosNum;
        }
      }

      if (req.query.tamanho) {
        const tamanhoNum = parseInt(req.query.tamanho, 10);
        if (!Number.isNaN(tamanhoNum)) {
          where.tamanho = tamanhoNum;
        }
      }

      if (req.query.repeticao != null && req.query.repeticao !== "") {
        const repeticaoNum = parseInt(req.query.repeticao, 10);
        if (!Number.isNaN(repeticaoNum)) {
          where.repeticao = repeticaoNum;
        }
      }

      const recordes = await RecordeSenha.findAll({
        where,
        attributes: [
          "id",
          "id_usuario",
          "digitos",
          "tamanho",
          "repeticao",
          "total",
          "tempo",
          "quantidade",
          "data_recorde",
          "criado_em",
          "atualizado_em",
        ],
        order: [
          ["digitos", "ASC"],
          ["tamanho", "ASC"],
          ["repeticao", "ASC"],
        ],
      });

      const recordesFormatados = recordes.map((recorde) => ({
        id: recorde.id,
        id_usuario: recorde.id_usuario,
        digitos: recorde.digitos,
        tamanho: recorde.tamanho,
        repeticao: recorde.repeticao,
        total: recorde.total,
        tempo: recorde.tempo,
        quantidade: recorde.quantidade,
        data_recorde: recorde.data_recorde || recorde.atualizado_em,
        criado_em: recorde.criado_em,
        atualizado_em: recorde.atualizado_em,
      }));

      return res.json(recordesFormatados);
    } catch (error) {
      console.error("Erro ao listar recordes de senha:", error);
      return res.status(500).json({
        message: "Erro ao listar recordes de senha",
        error: error.message,
      });
    }
  }

  /**
   * Lista os últimos N recordes de senha batidos (global).
   *
   * Query param: limite?
   */
  async listarUltimosBatidos(req, res) {
    try {
      const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);

      const recordes =
        await recordeSenhaService.listarUltimosRecordesBatidos(limite);

      const recordesFormatados = recordes.map((recorde) => ({
        id: recorde.id,
        digitos: recorde.digitos,
        tamanho: recorde.tamanho,
        repeticao: recorde.repeticao,
        total: recorde.total,
        tempo: recorde.tempo,
        data_recorde: recorde.data_recorde || recorde.atualizado_em,
        usuario: recorde.usuario
          ? { id: recorde.usuario.id, nome: recorde.usuario.nome }
          : null,
      }));

      return res.json(recordesFormatados);
    } catch (error) {
      console.error(
        "Erro ao listar últimos recordes de senha batidos:",
        error
      );
      return res.status(500).json({
        message: "Erro ao listar últimos recordes de senha batidos",
        error: error.message,
      });
    }
  }
}

module.exports = new RecordeSenhaController();
