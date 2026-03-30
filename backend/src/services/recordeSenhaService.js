"use strict";

const { RecordeSenha, Usuario } = require("../models");
const { Op } = require("sequelize");

class RecordeSenhaService {
  /**
   * Busca ou cria o registro em recordes_senha e incrementa quantidade.
   * Chamado quando o treino é confirmado (após contagem regressiva).
   *
   * @param {number} idUsuario
   * @param {number} digitos
   * @param {number} tamanho
   * @param {number} repeticao
   * @returns {Promise<void>}
   */
  async incrementarQuantidadeTreinoSenha(
    idUsuario,
    digitos,
    tamanho,
    repeticao
  ) {
    const idUsuarioNum = parseInt(idUsuario);
    const dataAtual = new Date();

    const where = {
      id_usuario: idUsuarioNum,
      digitos,
      tamanho,
      repeticao,
    };

    const recordeExistente = await RecordeSenha.findOne({ where });

    if (!recordeExistente) {
      try {
        await RecordeSenha.create({
          id_usuario: idUsuarioNum,
          digitos,
          tamanho,
          repeticao,
          total: 0,
          tempo: 0,
          quantidade: 1,
          criado_em: dataAtual,
          criado_por: idUsuarioNum,
          atualizado_em: dataAtual,
          atualizado_por: idUsuarioNum,
        });
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          const recordeCriado = await RecordeSenha.findOne({ where });

          if (recordeCriado) {
            await recordeCriado.increment("quantidade", { by: 1 });
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } else {
      await recordeExistente.increment("quantidade", { by: 1 });
    }
  }

  /**
   * Verifica se o resultado é recorde (menos tentativas = melhor;
   * desempate por menor tempo).
   *
   * @param {number} total - Tentativas do treino atual
   * @param {number} tempo - Tempo do treino atual (ms)
   * @param {number} recordeTotal - Tentativas do recorde existente
   * @param {number} recordeTempo - Tempo do recorde existente (ms)
   * @returns {boolean}
   */
  verificarSeBateuRecordeSenha(total, tempo, recordeTotal, recordeTempo) {
    if (recordeTotal === 0) return true;
    if (total < recordeTotal) return true;
    if (total === recordeTotal && tempo < recordeTempo) return true;
    return false;
  }

  /**
   * Verifica se existe recorde e salva/atualiza conforme necessário.
   *
   * @param {number} idUsuario
   * @param {number} digitos
   * @param {number} tamanho
   * @param {number} repeticao
   * @param {number} total - Número de tentativas para acertar
   * @param {number} tempo - Tempo em milissegundos
   * @returns {Promise<{ bateuRecorde: boolean, recordeAnterior: { total: number, tempo: number } | null, recordeAtual: { total: number, tempo: number } }>}
   */
  async verificarESalvarRecordeSenha(
    idUsuario,
    digitos,
    tamanho,
    repeticao,
    total,
    tempo
  ) {
    if (total <= 0) {
      throw new Error("Total de tentativas deve ser positivo");
    }

    const usuario = await Usuario.findByPk(idUsuario, {
      attributes: ["id", "ativo"],
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    const idUsuarioNum = parseInt(idUsuario);
    const dataAtual = new Date();

    const where = {
      id_usuario: idUsuarioNum,
      digitos,
      tamanho,
      repeticao,
    };

    const recordeExistente = await RecordeSenha.findOne({ where });

    let bateuRecorde = false;
    let recordeAnterior = null;

    if (!recordeExistente) {
      try {
        await RecordeSenha.create({
          id_usuario: idUsuarioNum,
          digitos,
          tamanho,
          repeticao,
          total,
          tempo,
          quantidade: 1,
          data_recorde: dataAtual,
          criado_em: dataAtual,
          criado_por: idUsuarioNum,
          atualizado_em: dataAtual,
          atualizado_por: idUsuarioNum,
        });

        bateuRecorde = true;
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          const recordeCriado = await RecordeSenha.findOne({ where });

          if (recordeCriado) {
            recordeAnterior = {
              total: recordeCriado.total,
              tempo: recordeCriado.tempo,
            };

            bateuRecorde = this.verificarSeBateuRecordeSenha(
              total,
              tempo,
              recordeCriado.total,
              recordeCriado.tempo
            );

            if (bateuRecorde) {
              await recordeCriado.update({
                total,
                tempo,
                data_recorde: dataAtual,
                atualizado_em: dataAtual,
                atualizado_por: idUsuarioNum,
              });
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } else {
      recordeAnterior = {
        total: recordeExistente.total,
        tempo: recordeExistente.tempo,
      };

      bateuRecorde = this.verificarSeBateuRecordeSenha(
        total,
        tempo,
        recordeExistente.total,
        recordeExistente.tempo
      );

      if (bateuRecorde) {
        await recordeExistente.update({
          total,
          tempo,
          data_recorde: dataAtual,
          atualizado_em: dataAtual,
          atualizado_por: idUsuarioNum,
        });
      }
    }

    return {
      bateuRecorde,
      recordeAnterior,
      recordeAtual: { total, tempo },
    };
  }

  /**
   * Lista todos os recordes de senha de um usuário.
   *
   * @param {number} idUsuario
   * @returns {Promise<Array>}
   */
  async listarRecordes(idUsuario) {
    const recordes = await RecordeSenha.findAll({
      where: {
        id_usuario: parseInt(idUsuario),
        total: { [Op.gt]: 0 },
      },
      attributes: [
        "id",
        "id_usuario",
        "digitos",
        "tamanho",
        "repeticao",
        "total",
        "tempo",
        "data_recorde",
        "quantidade",
      ],
      order: [
        ["digitos", "ASC"],
        ["tamanho", "ASC"],
        ["repeticao", "ASC"],
      ],
    });

    return recordes;
  }

  /**
   * Lista os últimos N recordes de senha batidos (global).
   *
   * @param {number} limite - Quantidade máxima (padrão: 20)
   * @returns {Promise<Array>}
   */
  async listarUltimosRecordesBatidos(limite = 20) {
    const recordes = await RecordeSenha.findAll({
      where: {
        total: { [Op.gt]: 0 },
        id_usuario: { [Op.gt]: 0 },
      },
      attributes: [
        "id",
        "id_usuario",
        "digitos",
        "tamanho",
        "repeticao",
        "total",
        "tempo",
        "data_recorde",
        "atualizado_em",
      ],
      include: [
        {
          association: "usuario",
          required: true,
          attributes: ["id", "nome"],
        },
      ],
      order: [["data_recorde", "DESC"]],
      limit: Math.min(limite, 100),
    });

    return recordes;
  }
}

module.exports = new RecordeSenhaService();
