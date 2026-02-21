"use strict";

const {
  RecordeCalendario,
  Usuario,
  Limite,
  Conjunto,
  UsuarioConjunto,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

class RankingCalendarioService {
  /**
   * Obtém ranking de calendário (global ou por conjunto).
   * @param {Object} filtros - Filtros: tipo, id_limite, conjunto_id (opcional)
   * @param {number} usuarioId - ID do usuário logado
   * @param {string} usuarioTipo - Tipo do usuário logado (admin, comum, profe)
   * @returns {Promise<{ ranking: any[], posicaoUsuario: number|null, totalParticipantes: number }>}
   */
  async obterRanking(filtros, usuarioId, usuarioTipo) {
    // Validar filtros obrigatórios
    if (!filtros.tipo || !filtros.id_limite) {
      throw new Error("Filtros obrigatórios: tipo, id_limite");
    }

    // Validar que limite existe
    const limite = await Limite.findByPk(filtros.id_limite, {
      attributes: ["id", "descricao", "tempo"],
    });

    if (!limite) {
      throw new Error("Limite não encontrado");
    }

    // Se conjunto_id fornecido, validar que usuário pertence ao conjunto
    let usuariosConjuntoIds = null;
    if (filtros.conjunto_id) {
      const conjunto = await Conjunto.findByPk(filtros.conjunto_id, {
        attributes: ["id", "ativo"],
      });

      if (!conjunto) {
        throw new Error("Conjunto não encontrado");
      }

      if (!conjunto.ativo) {
        throw new Error("Conjunto inativo");
      }

      if (usuarioTipo !== "admin") {
        const usuarioConjunto = await UsuarioConjunto.findOne({
          where: {
            id_conjunto: filtros.conjunto_id,
            id_usuario: usuarioId,
            status: "aceito",
          },
          attributes: ["id"],
        });

        if (!usuarioConjunto) {
          throw new Error(
            "Usuário não pertence ao conjunto ou convite não foi aceito"
          );
        }
      }

      const usuariosConjunto = await UsuarioConjunto.findAll({
        where: {
          id_conjunto: filtros.conjunto_id,
          status: "aceito",
        },
        attributes: ["id_usuario"],
      });

      usuariosConjuntoIds = usuariosConjunto.map((uc) => uc.id_usuario);
    }

    // where para recordes de calendário
    const whereRecorde = {
      tipo: filtros.tipo,
      id_limite: filtros.id_limite,
    };

    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = { [Op.in]: usuariosConjuntoIds };
    }

    // Ranking global: apenas ativos com ranking_global. Ranking por conjunto: apenas ativos.
    const whereUsuario = {
      ativo: true,
    };
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    // Total de participantes (usuários distintos) nesse filtro
    const totalParticipantes = await RecordeCalendario.count({
      where: whereRecorde,
      include: [
        {
          model: Usuario,
          as: "usuario",
          required: true,
          where: whereUsuario,
        },
      ],
      distinct: true,
      col: "id_usuario",
    });

    // Buscar top 100 recordes de calendário nesse filtro
    const recordesOrdenados = await RecordeCalendario.findAll({
      where: whereRecorde,
      attributes: [
        "id_usuario",
        "total",
        "erros",
        "quantidade",
        "data_recorde",
        "atualizado_em",
      ],
      include: [
        {
          model: Usuario,
          as: "usuario",
          required: true,
          where: whereUsuario,
          attributes: ["id", "nome", "ativo"],
        },
      ],
      // Mesma lógica de ordenação usada em Recorde:
      // total DESC, erros ASC (NULL como pior), quantidade ASC, data_recorde ASC (fallback atualizado_em)
      order: [
        ["total", "DESC"],
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("RecordeCalendario.erros"),
            9999999
          ),
          "ASC",
        ],
        ["quantidade", "ASC"],
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("RecordeCalendario.data_recorde"),
            Sequelize.col("RecordeCalendario.atualizado_em")
          ),
          "ASC",
        ],
      ],
      limit: 100,
    });

    const ranking = recordesOrdenados.map((recorde, index) => ({
      posicao: index + 1,
      id_usuario: recorde.id_usuario,
      nome: recorde.usuario.nome,
      total: recorde.total,
      erros: recorde.erros,
      quantidade: recorde.quantidade,
      data_recorde: recorde.data_recorde || recorde.atualizado_em,
    }));

    const posicaoUsuario = await this.obterPosicaoUsuario(
      filtros,
      usuarioId,
      usuarioTipo
    );

    return {
      ranking,
      posicaoUsuario,
      totalParticipantes,
    };
  }

  /**
   * Calcula posição exata do usuário no ranking de calendário
   * @param {{ tipo: string, id_limite: number, conjunto_id?: number }} filtros
   * @param {number} usuarioId
   * @param {string} usuarioTipo
   * @returns {Promise<number|null>} Posição (1-based) ou null se não tem recorde
   */
  async obterPosicaoUsuario(filtros, usuarioId, usuarioTipo) {
    if (!filtros.tipo || !filtros.id_limite) {
      throw new Error("Filtros obrigatórios: tipo, id_limite");
    }

    let usuariosConjuntoIds = null;
    if (filtros.conjunto_id) {
      const conjunto = await Conjunto.findByPk(filtros.conjunto_id, {
        attributes: ["id", "ativo"],
      });
      if (!conjunto || !conjunto.ativo) {
        throw new Error("Conjunto não encontrado ou inativo");
      }
      if (usuarioTipo !== "admin") {
        const usuarioConjunto = await UsuarioConjunto.findOne({
          where: {
            id_conjunto: filtros.conjunto_id,
            id_usuario: usuarioId,
            status: "aceito",
          },
          attributes: ["id"],
        });
        if (!usuarioConjunto) {
          return null;
        }
      }
      const usuariosConjunto = await UsuarioConjunto.findAll({
        where: {
          id_conjunto: filtros.conjunto_id,
          status: "aceito",
        },
        attributes: ["id_usuario"],
      });
      usuariosConjuntoIds = usuariosConjunto.map((uc) => uc.id_usuario);
    }

    const whereUsuarioRecorde = {
      ativo: true,
    };
    if (usuariosConjuntoIds === null) {
      whereUsuarioRecorde.ranking_global = true;
    }

    const whereRecordeUsuario = {
      id_usuario: usuarioId,
      tipo: filtros.tipo,
      id_limite: filtros.id_limite,
    };

    const recordeUsuario = await RecordeCalendario.findOne({
      where: whereRecordeUsuario,
      attributes: ["total", "erros", "quantidade", "data_recorde", "atualizado_em"],
      include: [
        {
          model: Usuario,
          as: "usuario",
          required: true,
          where: whereUsuarioRecorde,
        },
      ],
    });

    if (!recordeUsuario) {
      return null;
    }

    const whereRecorde = {
      tipo: filtros.tipo,
      id_limite: filtros.id_limite,
    };
    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = { [Op.in]: usuariosConjuntoIds };
    }

    const whereUsuario = {
      ativo: true,
    };
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    const errosUsuario = recordeUsuario.erros ?? 9999999;
    const dataRecordeUsuario =
      recordeUsuario.data_recorde || recordeUsuario.atualizado_em;

    const posicao = await RecordeCalendario.count({
      where: {
        ...whereRecorde,
        [Op.or]: [
          // Total maior
          { total: { [Op.gt]: recordeUsuario.total } },
          // Total igual e menos erros
          {
            total: recordeUsuario.total,
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "COALESCE",
                  Sequelize.col("RecordeCalendario.erros"),
                  9999999
                ),
                Op.lt,
                errosUsuario
              ),
            ],
          },
          // Total igual, mesmos erros e menos quantidade
          {
            total: recordeUsuario.total,
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "COALESCE",
                  Sequelize.col("RecordeCalendario.erros"),
                  9999999
                ),
                Op.eq,
                errosUsuario
              ),
              { quantidade: { [Op.lt]: recordeUsuario.quantidade } },
            ],
          },
          // Total igual, mesmos erros, mesma quantidade e data mais antiga
          {
            total: recordeUsuario.total,
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "COALESCE",
                  Sequelize.col("RecordeCalendario.erros"),
                  9999999
                ),
                Op.eq,
                errosUsuario
              ),
              { quantidade: recordeUsuario.quantidade },
              Sequelize.where(
                Sequelize.fn(
                  "COALESCE",
                  Sequelize.col("RecordeCalendario.data_recorde"),
                  Sequelize.col("RecordeCalendario.atualizado_em")
                ),
                Op.lt,
                dataRecordeUsuario
              ),
            ],
          },
        ],
      },
      include: [
        {
          model: Usuario,
          as: "usuario",
          required: true,
          where: whereUsuario,
        },
      ],
    });

    return posicao + 1;
  }
}

module.exports = new RankingCalendarioService();

