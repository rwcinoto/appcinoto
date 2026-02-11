"use strict";

const { RecordeCalendario, Usuario, Limite } = require("../models");
const { Op, Sequelize } = require("sequelize");

class RankingCalendarioService {
  /**
   * Obtém ranking de calendário (sempre global, sem conjuntos).
   * @param {Object} filtros - Filtros: tipo, id_limite
   * @param {number} usuarioId - ID do usuário logado
   * @returns {Promise<{ ranking: any[], posicaoUsuario: number|null, totalParticipantes: number }>}
   */
  async obterRanking(filtros, usuarioId) {
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

    // where para recordes de calendário
    const whereRecorde = {
      tipo: filtros.tipo,
      id_limite: filtros.id_limite,
    };

    // Apenas usuários ativos e com ranking_global = true aparecem no ranking global
    const whereUsuario = {
      ativo: true,
      ranking_global: true,
    };

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

    const posicaoUsuario = await this.obterPosicaoUsuario(filtros, usuarioId);

    return {
      ranking,
      posicaoUsuario,
      totalParticipantes,
    };
  }

  /**
   * Calcula posição exata do usuário no ranking de calendário
   * @param {{ tipo: string, id_limite: number }} filtros
   * @param {number} usuarioId
   * @returns {Promise<number|null>} Posição (1-based) ou null se não tem recorde
   */
  async obterPosicaoUsuario(filtros, usuarioId) {
    if (!filtros.tipo || !filtros.id_limite) {
      throw new Error("Filtros obrigatórios: tipo, id_limite");
    }

    // where do usuário para verificar se ele pode aparecer no ranking global
    const whereUsuarioRecorde = {
      ativo: true,
      ranking_global: true,
    };

    // Buscar recorde do usuário para esse tipo/limite
    const recordeUsuario = await RecordeCalendario.findOne({
      where: {
        id_usuario: usuarioId,
        tipo: filtros.tipo,
        id_limite: filtros.id_limite,
      },
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

    // Para o ranking global, usar mesmos critérios de ordenação do obterRanking
    const whereUsuario = {
      ativo: true,
      ranking_global: true,
    };

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

