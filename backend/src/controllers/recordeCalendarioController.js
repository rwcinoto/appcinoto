"use strict";

const { validationResult } = require("express-validator");
const { Limite, Usuario, RecordeCalendario } = require("../models");
const recordeCalendarioService = require("../services/recordeCalendarioService");

class RecordeCalendarioController {
  /**
   * Lista recordes de calendário de um usuário.
   *
   * Filtros via query string:
   * - tipo (opcional): "data_geral" | "mes" | "ano" | "seculo" | "data_21"
   * - limite_id (opcional): ID do limite
   * - usuario_id (opcional): usuário alvo (padrão: usuário logado)
   *
   * Visitantes (usuario_id = 0) não têm recordes salvos.
   */
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const filtros = {};

      if (req.query.tipo) {
        filtros.tipo = String(req.query.tipo);
      }

      if (req.query.limite_id) {
        const limiteId = parseInt(req.query.limite_id, 10);
        if (Number.isNaN(limiteId)) {
          return res.status(400).json({
            message: "limite_id deve ser um número válido",
          });
        }

        const limite = await Limite.findByPk(limiteId);
        if (!limite) {
          return res.status(404).json({ message: "Limite não encontrado" });
        }

        filtros.id_limite = limiteId;
      }

      // Determinar usuário alvo (default: usuário logado)
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

      // Visitantes (id=0) não têm recordes salvos
      if (usuarioIdParaBuscar === 0) {
        return res.json([]);
      }

      // Confirmar que o usuário alvo existe (para evitar retornar dados órfãos)
      const usuarioAlvo = await Usuario.findByPk(usuarioIdParaBuscar, {
        attributes: ["id"],
      });

      if (!usuarioAlvo) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      const where = {
        id_usuario: usuarioIdParaBuscar,
        ...filtros,
      };

      const recordes = await RecordeCalendario.findAll({
        where,
        attributes: [
          "id",
          "id_usuario",
          "tipo",
          "id_limite",
          "total",
          "erros",
          "quantidade",
          "data_recorde",
          "criado_em",
          "atualizado_em",
          "criado_por",
          "atualizado_por",
        ],
        include: [
          {
            model: Limite,
            as: "limite",
            required: true,
            attributes: ["id", "descricao", "tempo", "id_plano"],
          },
        ],
        order: [
          // Ordenar por tipo (para manter agrupado por tipo de treino),
          // depois por tempo do limite
          ["tipo", "ASC"],
          [{ model: Limite, as: "limite" }, "tempo", "ASC"],
        ],
      });

      const recordesFormatados = recordes.map((recorde) => ({
        id: recorde.id,
        id_usuario: recorde.id_usuario,
        tipo: recorde.tipo,
        id_limite: recorde.id_limite,
        total: recorde.total,
        erros: recorde.erros,
        quantidade: recorde.quantidade,
        data_recorde: recorde.data_recorde || recorde.atualizado_em,
        criado_em: recorde.criado_em,
        atualizado_em: recorde.atualizado_em,
        limite: recorde.limite
          ? {
              id: recorde.limite.id,
              descricao: recorde.limite.descricao,
              tempo: recorde.limite.tempo,
            }
          : null,
      }));

      return res.json(recordesFormatados);
    } catch (error) {
      console.error("Erro ao listar recordes de calendário:", error);
      return res.status(500).json({
        message: "Erro ao listar recordes de calendário",
        error: error.message,
      });
    }
  }

  /**
   * Lista os últimos N recordes de calendário batidos (de todos os usuários)
   */
  async listarUltimosBatidos(req, res) {
    try {
      const limite = Math.min(parseInt(req.query.limite, 10) || 20, 100);

      const recordes =
        await recordeCalendarioService.listarUltimosRecordesBatidos(limite);

      const recordesFormatados = recordes.map((recorde) => ({
        id: recorde.id,
        tipo: recorde.tipo,
        total: recorde.total,
        data_recorde: recorde.data_recorde || recorde.atualizado_em,
        usuario: recorde.usuario
          ? { id: recorde.usuario.id, nome: recorde.usuario.nome }
          : null,
        limite: recorde.limite
          ? { id: recorde.limite.id, descricao: recorde.limite.descricao }
          : null,
      }));

      return res.json(recordesFormatados);
    } catch (error) {
      console.error(
        "Erro ao listar últimos recordes de calendário batidos:",
        error
      );
      return res.status(500).json({
        message: "Erro ao listar últimos recordes de calendário batidos",
        error: error.message,
      });
    }
  }
}

module.exports = new RecordeCalendarioController();

