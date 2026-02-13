"use strict";

const { RecordeCalendario, Usuario, Limite } = require("../models");
const { Op } = require("sequelize");

class RecordeCalendarioService {
  /**
   * Incrementa a quantidade de treinos de calendário realizados
   * (ou cria o registro se não existir).
   *
   * Deve ser chamado quando o treino de calendário é iniciado
   * (antes da contagem regressiva), semelhante a incrementarQuantidadeTreino.
   *
   * @param {number} usuarioId
   * @param {string} tipo - Tipo de treino (data_geral, mes, ano, seculo, data_21)
   * @param {number} limiteId
   * @returns {Promise<void>}
   */
  async incrementarQuantidadeTreinoCalendario(usuarioId, tipo, limiteId) {
    const usuarioIdNum = parseInt(usuarioId);
    const limiteIdNum = parseInt(limiteId);

    const dataAtual = new Date();

    const recordeExistente = await RecordeCalendario.findOne({
      where: {
        id_usuario: usuarioIdNum,
        tipo,
        id_limite: limiteIdNum,
      },
    });

    if (!recordeExistente) {
      try {
        await RecordeCalendario.create({
          id_usuario: usuarioIdNum,
          tipo,
          id_limite: limiteIdNum,
          total: 0,
          quantidade: 1,
          criado_em: dataAtual,
          criado_por: usuarioIdNum,
          atualizado_em: dataAtual,
          atualizado_por: usuarioIdNum,
        });
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          const recordeCriado = await RecordeCalendario.findOne({
            where: {
              id_usuario: usuarioIdNum,
              tipo,
              id_limite: limiteIdNum,
            },
          });

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
   * Verifica se bateu recorde de calendário considerando total e erros.
   * Mesma regra do recorde de operações.
   *
   * @param {number} total
   * @param {number|null} erros
   * @param {number} recordeTotal
   * @param {number|null} recordeErros
   * @returns {boolean}
   */
  verificarSeBateuRecordeCalendario(total, erros, recordeTotal, recordeErros) {
    if (total > recordeTotal) {
      return true;
    }

    if (total === recordeTotal) {
      if (recordeErros === null || recordeErros === undefined) {
        return true;
      }

      if (erros === null || erros === undefined) {
        return false;
      }

      if (erros < recordeErros) {
        return true;
      }
    }

    return false;
  }

  /**
   * Verifica se existe recorde de calendário e salva/atualiza conforme necessário.
   *
   * @param {number} usuarioId
   * @param {string} tipo - Tipo de treino (data_geral, mes, ano, seculo, data_21)
   * @param {number} limiteId
   * @param {number} total
   * @param {number|null} erros
   * @returns {Promise<{ criado: boolean, atualizado: boolean, bateuRecorde: boolean, recordeAnterior: any }>}
   */
  async verificarESalvarRecordeCalendario(
    usuarioId,
    tipo,
    limiteId,
    total,
    erros = null
  ) {
    if (total < 0) {
      throw new Error("Total de acertos não pode ser negativo");
    }

    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "ativo"],
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    const limite = await Limite.findByPk(limiteId, {
      attributes: ["id", "descricao"],
    });

    if (!limite) {
      throw new Error("Limite não encontrado");
    }

    const usuarioIdNum = parseInt(usuarioId);
    const limiteIdNum = parseInt(limiteId);

    const recordeExistente = await RecordeCalendario.findOne({
      where: {
        id_usuario: usuarioIdNum,
        tipo,
        id_limite: limiteIdNum,
      },
    });

    const dataAtual = new Date();

    let criado = false;
    let atualizado = false;
    let bateuRecorde = false;
    let recordeAnterior = null;

    if (!recordeExistente) {
      try {
        await RecordeCalendario.create({
          id_usuario: usuarioIdNum,
          tipo,
          id_limite: limiteIdNum,
          total,
          erros,
          quantidade: 1,
          data_recorde: dataAtual,
          criado_em: dataAtual,
          criado_por: usuarioIdNum,
          atualizado_em: dataAtual,
          atualizado_por: usuarioIdNum,
        });

        criado = true;
        bateuRecorde = true;
        recordeAnterior = null;
      } catch (error) {
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          const recordeCriado = await RecordeCalendario.findOne({
            where: {
              id_usuario: usuarioIdNum,
              tipo,
              id_limite: limiteIdNum,
            },
          });

          if (recordeCriado) {
            bateuRecorde = this.verificarSeBateuRecordeCalendario(
              total,
              erros,
              recordeCriado.total,
              recordeCriado.erros
            );

            recordeAnterior = {
              total: recordeCriado.total,
              erros: recordeCriado.erros,
              atualizado_em: recordeCriado.atualizado_em,
            };

            if (bateuRecorde) {
              await recordeCriado.update({
                total,
                erros,
                data_recorde: dataAtual,
                atualizado_em: dataAtual,
                atualizado_por: usuarioIdNum,
              });

              atualizado = true;
            }
          } else {
            throw error;
          }
        } else {
          throw error;
        }
      }
    } else {
      bateuRecorde = this.verificarSeBateuRecordeCalendario(
        total,
        erros,
        recordeExistente.total,
        recordeExistente.erros
      );

      recordeAnterior = {
        total: recordeExistente.total,
        erros: recordeExistente.erros,
        atualizado_em: recordeExistente.atualizado_em,
      };

      if (bateuRecorde) {
        await recordeExistente.update({
          total,
          erros,
          data_recorde: dataAtual,
          atualizado_em: dataAtual,
          atualizado_por: usuarioIdNum,
        });

        atualizado = true;
      }
    }

    return {
      criado,
      atualizado,
      bateuRecorde,
      recordeAnterior: recordeAnterior ? recordeAnterior : null,
      errosAtuais: erros,
    };
  }

  /**
   * Lista os últimos N recordes de calendário batidos (de todos os usuários), ordenados por data
   * @param {number} limite - Quantidade máxima (padrão: 20)
   * @returns {Promise<Array>} Array de recordes com usuario e limite
   */
  async listarUltimosRecordesBatidos(limite = 20) {
    const recordes = await RecordeCalendario.findAll({
      where: {
        total: { [Op.gt]: 0 },
        id_usuario: { [Op.gt]: 0 },
      },
      attributes: [
        "id",
        "id_usuario",
        "tipo",
        "id_limite",
        "total",
        "data_recorde",
        "atualizado_em",
      ],
      include: [
        {
          association: "usuario",
          required: true,
          attributes: ["id", "nome"],
        },
        {
          association: "limite",
          required: true,
          attributes: ["id", "descricao", "tempo"],
        },
      ],
      order: [["atualizado_em", "DESC"]],
      limit: Math.min(limite, 100),
    });

    return recordes;
  }
}

module.exports = new RecordeCalendarioService();

