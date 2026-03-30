"use strict";

const {
  RecordeSenha,
  Usuario,
  Conjunto,
  UsuarioConjunto,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

class RankingSenhaService {
  /**
   * Obtém ranking de senha (global ou por conjunto).
   *
   * @param {Object} filtros - { digitos, tamanho, repeticao, conjunto_id? }
   * @param {number} usuarioId - ID do usuário logado
   * @param {string} usuarioTipo - Tipo do usuário logado (admin, comum, profe)
   * @returns {Promise<{ ranking: any[], posicaoUsuario: number|null, totalParticipantes: number }>}
   */
  async obterRanking(filtros, usuarioId, usuarioTipo) {
    if (
      filtros.digitos == null ||
      filtros.tamanho == null ||
      filtros.repeticao == null
    ) {
      throw new Error("Filtros obrigatórios: digitos, tamanho, repeticao");
    }

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

    const whereRecorde = {
      digitos: filtros.digitos,
      tamanho: filtros.tamanho,
      repeticao: filtros.repeticao,
      total: { [Op.gt]: 0 },
    };

    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = { [Op.in]: usuariosConjuntoIds };
    }

    const whereUsuario = { ativo: true };
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    const totalParticipantes = await RecordeSenha.count({
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

    const recordesOrdenados = await RecordeSenha.findAll({
      where: whereRecorde,
      attributes: [
        "id_usuario",
        "total",
        "tempo",
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
      order: [
        ["total", "ASC"],
        ["tempo", "ASC"],
        [
          Sequelize.fn(
            "COALESCE",
            Sequelize.col("RecordeSenha.data_recorde"),
            Sequelize.col("RecordeSenha.atualizado_em")
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
      tempo: recorde.tempo,
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
   * Calcula posição exata do usuário no ranking de senha.
   *
   * @param {{ digitos: number, tamanho: number, repeticao: number, conjunto_id?: number }} filtros
   * @param {number} usuarioId
   * @param {string} usuarioTipo
   * @returns {Promise<number|null>}
   */
  async obterPosicaoUsuario(filtros, usuarioId, usuarioTipo) {
    if (
      filtros.digitos == null ||
      filtros.tamanho == null ||
      filtros.repeticao == null
    ) {
      throw new Error("Filtros obrigatórios: digitos, tamanho, repeticao");
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

    const whereUsuarioRecorde = { ativo: true };
    if (usuariosConjuntoIds === null) {
      whereUsuarioRecorde.ranking_global = true;
    }

    const recordeUsuario = await RecordeSenha.findOne({
      where: {
        id_usuario: usuarioId,
        digitos: filtros.digitos,
        tamanho: filtros.tamanho,
        repeticao: filtros.repeticao,
        total: { [Op.gt]: 0 },
      },
      attributes: ["total", "tempo", "data_recorde", "atualizado_em"],
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
      digitos: filtros.digitos,
      tamanho: filtros.tamanho,
      repeticao: filtros.repeticao,
      total: { [Op.gt]: 0 },
    };
    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = { [Op.in]: usuariosConjuntoIds };
    }

    const whereUsuario = { ativo: true };
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    const dataRecordeUsuario =
      recordeUsuario.data_recorde || recordeUsuario.atualizado_em;

    const posicao = await RecordeSenha.count({
      where: {
        ...whereRecorde,
        [Op.or]: [
          { total: { [Op.lt]: recordeUsuario.total } },
          {
            total: recordeUsuario.total,
            tempo: { [Op.lt]: recordeUsuario.tempo },
          },
          {
            total: recordeUsuario.total,
            tempo: recordeUsuario.tempo,
            [Op.and]: [
              Sequelize.where(
                Sequelize.fn(
                  "COALESCE",
                  Sequelize.col("RecordeSenha.data_recorde"),
                  Sequelize.col("RecordeSenha.atualizado_em")
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

module.exports = new RankingSenhaService();
