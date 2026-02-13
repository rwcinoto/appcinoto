"use strict";

const {
  Recorde,
  Usuario,
  Operacao,
  Limite,
  Sistema,
  Plano,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

class RecordeService {
  /**
   * Incrementa a quantidade de treinos realizados (ou cria registro se não existir)
   * Deve ser chamado quando o treino é iniciado (antes da contagem regressiva)
   * @param {number} usuarioId - ID do usuário
   * @param {number} operacaoId - ID da operação
   * @param {number} limiteId - ID do limite
   * @param {number} sistemaId - ID do sistema
   * @returns {Promise<void>}
   */
  async incrementarQuantidadeTreino(
    usuarioId,
    operacaoId,
    limiteId,
    sistemaId,
  ) {
    // Garantir que os IDs são números
    const usuarioIdNum = parseInt(usuarioId);
    const operacaoIdNum = parseInt(operacaoId);
    const limiteIdNum = parseInt(limiteId);
    const sistemaIdNum = parseInt(sistemaId);

    // Data atual no horário do Brasil (UTC-3)
    const dataAtual = new Date();

    // Buscar recorde existente
    const recordeExistente = await Recorde.findOne({
      where: {
        id_usuario: usuarioIdNum,
        id_operacao: operacaoIdNum,
        id_limite: limiteIdNum,
        id_sistema: sistemaIdNum,
      },
    });

    if (!recordeExistente) {
      // Se não existe, criar registro com quantidade=1 e total=0
      // Tentar criar, se falhar por constraint única (race condition), incrementar o existente
      try {
        await Recorde.create({
          id_usuario: usuarioIdNum,
          id_operacao: operacaoIdNum,
          id_limite: limiteIdNum,
          id_sistema: sistemaIdNum,
          total: 0, // Total inicial é zero (ainda não finalizou o treino)
          quantidade: 1, // Primeiro treino
          criado_em: dataAtual,
          criado_por: usuarioIdNum,
          atualizado_em: dataAtual,
          atualizado_por: usuarioIdNum,
        });
      } catch (error) {
        // Se o erro for de constraint única, significa que o recorde foi criado entre a busca e a criação
        // (race condition) - buscar novamente e incrementar
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          const recordeCriado = await Recorde.findOne({
            where: {
              id_usuario: usuarioIdNum,
              id_operacao: operacaoIdNum,
              id_limite: limiteIdNum,
              id_sistema: sistemaIdNum,
            },
          });

          if (recordeCriado) {
            // Incrementar quantidade
            await recordeCriado.increment("quantidade", { by: 1 });
          } else {
            // Se não encontrou, relançar o erro original
            throw error;
          }
        } else {
          // Se for outro tipo de erro, relançar
          throw error;
        }
      }
    } else {
      // Se existe, incrementar quantidade
      await recordeExistente.increment("quantidade", { by: 1 });
    }
  }

  /**
   * Verifica se bateu recorde considerando total e erros
   * @param {number} total - Total de acertos do treino atual
   * @param {number|null} erros - Total de erros do treino atual
   * @param {number} recordeTotal - Total de acertos do recorde existente
   * @param {number|null} recordeErros - Total de erros do recorde existente
   * @returns {boolean} true se bateu recorde, false caso contrário
   */
  verificarSeBateuRecorde(total, erros, recordeTotal, recordeErros) {
    // Primeiro critério: total maior sempre bate recorde
    if (total > recordeTotal) {
      return true;
    }

    // Segundo critério: se total é igual, verificar erros
    if (total === recordeTotal) {
      // Se o recorde antigo não tem informação de erros (NULL), significa que bateu o recorde com menos erros
      if (recordeErros === null || recordeErros === undefined) {
        return true;
      }

      // Se o treino atual não tem informação de erros (NULL), não bateu recorde
      if (erros === null || erros === undefined) {
        return false;
      }

      // Se tem menos erros, bateu recorde
      if (erros < recordeErros) {
        return true;
      }
    }

    // Caso contrário, não bateu recorde
    return false;
  }

  /**
   * Verifica se existe recorde e salva/atualiza conforme necessário
   * ATENÇÃO: Este método assume que o registro já existe (criado por incrementarQuantidadeTreino)
   * Se não existir, será criado (para compatibilidade), mas o ideal é que já exista
   * @param {number} usuarioId - ID do usuário
   * @param {number} operacaoId - ID da operação
   * @param {number} limiteId - ID do limite
   * @param {number} sistemaId - ID do sistema
   * @param {number} total - Total de acertos
   * @param {number|null} erros - Total de erros (null = sem informação para treinos antigos, número = quantidade real)
   * @returns {Promise<Object>} Objeto com informações sobre a operação
   */
  async verificarESalvarRecorde(
    usuarioId,
    operacaoId,
    limiteId,
    sistemaId,
    total,
    erros = null,
  ) {
    // Validações iniciais
    if (total < 0) {
      throw new Error("Total de acertos não pode ser negativo");
    }

    // Verificar se usuário existe e está ativo
    // NOTA: Não validamos acesso ao plano aqui porque:
    // - Se o usuário conseguiu iniciar o treino, o acesso já foi validado no treinoController.iniciar
    // - O treino só existe se o usuário tinha acesso aos recursos
    // - Validar novamente seria redundante e pode causar problemas desnecessários
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "ativo"],
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    if (!usuario.ativo) {
      throw new Error("Usuário inativo");
    }

    // Verificar se operação, limite e sistema existem (paralelo para melhor performance)
    // Selecionar apenas campos necessários
    // NOTA: Não validamos acesso ao plano aqui porque:
    // - Se o usuário conseguiu iniciar o treino, o acesso já foi validado no treinoController.iniciar
    // - O treino só existe se o usuário tinha acesso aos recursos
    // - Validar novamente seria redundante e pode causar problemas desnecessários
    const [operacao, limite, sistema] = await Promise.all([
      Operacao.findByPk(operacaoId, {
        attributes: ["id", "nome"],
      }),
      Limite.findByPk(limiteId, {
        attributes: ["id", "descricao"],
      }),
      Sistema.findByPk(sistemaId, {
        attributes: ["id", "descricao", "tipo"],
      }),
    ]);

    if (!operacao) {
      throw new Error("Operação não encontrada");
    }

    if (!limite) {
      throw new Error("Limite não encontrado");
    }

    if (!sistema) {
      throw new Error("Sistema não encontrado");
    }

    // Garantir que os IDs são números (pode haver problemas de tipo)
    const usuarioIdNum = parseInt(usuarioId);
    const operacaoIdNum = parseInt(operacaoId);
    const limiteIdNum = parseInt(limiteId);
    const sistemaIdNum = parseInt(sistemaId);

    // Buscar recorde existente para esta combinação
    // Usar índice único composto (idx_recordes_unique) para busca rápida
    // NOTA: O registro deve já existir (criado por incrementarQuantidadeTreino ao iniciar o treino)
    const recordeExistente = await Recorde.findOne({
      where: {
        id_usuario: usuarioIdNum, // Índice: idx_recordes_unique
        id_operacao: operacaoIdNum, // Índice: idx_recordes_unique
        id_limite: limiteIdNum, // Índice: idx_recordes_unique
        id_sistema: sistemaIdNum, // Índice: idx_recordes_unique
      },
      // Não especificar attributes para buscar todos os campos (incluindo data_recorde)
    });

    // Data atual no horário do Brasil (UTC-3)
    // O Sequelize já está configurado com timezone "-03:00", então new Date() será tratado corretamente
    const dataAtual = new Date();

    let criado = false;
    let atualizado = false;
    let bateuRecorde = false;
    let recordeAnterior = null;

    if (!recordeExistente) {
      // Se não existe, criar (para compatibilidade - idealmente já deveria existir)
      // Isso pode acontecer se o incrementarQuantidadeTreino não foi chamado (treinos antigos, etc)
      try {
        await Recorde.create({
          id_usuario: usuarioIdNum,
          id_operacao: operacaoIdNum,
          id_limite: limiteIdNum,
          id_sistema: sistemaIdNum,
          total: total,
          erros: erros,
          quantidade: 1, // Se foi criado aqui, é o primeiro treino
          data_recorde: dataAtual, // Data em que o recorde foi batido
          criado_em: dataAtual,
          criado_por: usuarioIdNum,
          atualizado_em: dataAtual,
          atualizado_por: usuarioIdNum,
        });

        criado = true;
        bateuRecorde = true;
        recordeAnterior = null; // Primeiro recorde, não há recorde anterior
      } catch (error) {
        // Se o erro for de constraint única, significa que o recorde foi criado entre a busca e a criação
        // (race condition) - buscar novamente e atualizar
        if (
          error.name === "SequelizeUniqueConstraintError" ||
          error.parent?.code === "ER_DUP_ENTRY"
        ) {
          // Buscar o recorde que foi criado por outra requisição
          const recordeCriado = await Recorde.findOne({
            where: {
              id_usuario: usuarioIdNum,
              id_operacao: operacaoIdNum,
              id_limite: limiteIdNum,
              id_sistema: sistemaIdNum,
            },
            // Não especificar attributes para buscar todos os campos (incluindo data_recorde)
          });

          if (recordeCriado) {
            // Verificar se bateu recorde (considerando total e erros)
            bateuRecorde = this.verificarSeBateuRecorde(
              total,
              erros,
              recordeCriado.total,
              recordeCriado.erros,
            );

            recordeAnterior = {
              total: recordeCriado.total,
              erros: recordeCriado.erros,
              atualizado_em: recordeCriado.atualizado_em,
            };

            if (bateuRecorde) {
              await recordeCriado.update({
                total: total,
                erros: erros,
                data_recorde: dataAtual, // Data em que o novo recorde foi batido
                atualizado_em: dataAtual,
                atualizado_por: usuarioIdNum,
              });

              atualizado = true;
            }
          } else {
            // Se não encontrou, relançar o erro original
            throw error;
          }
        } else {
          // Se for outro tipo de erro, relançar
          throw error;
        }
      }
    } else {
      // Verificar se bateu recorde (considerando total e erros)
      bateuRecorde = this.verificarSeBateuRecorde(
        total,
        erros,
        recordeExistente.total,
        recordeExistente.erros,
      );

      // Salvar recorde anterior antes de atualizar
      recordeAnterior = {
        total: recordeExistente.total,
        erros: recordeExistente.erros,
        atualizado_em: recordeExistente.atualizado_em,
      };

      if (bateuRecorde) {
        // Atualizar recorde
        // IMPORTANTE: Sempre salvar data_recorde quando um novo recorde é batido
        // Isso inclui o caso especial quando o recorde anterior tinha total: 0 (criado por incrementarQuantidadeTreino)
        // e agora temos o primeiro recorde real (total > 0)
        // Também inclui o caso onde total é igual mas erros é menor
        await recordeExistente.update({
          total: total,
          erros: erros,
          data_recorde: dataAtual, // Data em que o novo recorde foi batido
          atualizado_em: dataAtual, // Data do novo recorde
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
      errosAtuais: erros, // Incluir erros do treino atual para exibição
    };
  }

  /**
   * Lista recordes do usuário com filtros opcionais
   * @param {number} usuarioId - ID do usuário
   * @param {Object} filtros - Filtros opcionais (operacao_id, tipo_operacao, limite_id, sistema_id, plano_id)
   * @returns {Promise<Array>} Array de recordes
   */
  async listarRecordes(usuarioId, filtros = {}) {
    // Verificar se usuário existe
    const usuario = await Usuario.findByPk(usuarioId, {
      attributes: ["id", "ativo"],
    });

    if (!usuario) {
      throw new Error("Usuário não encontrado");
    }

    // Construir condições de busca (usando índices do banco)
    const where = {
      id_usuario: usuarioId, // Índice: idx_recordes_id_usuario
    };

    // Aplicar filtros opcionais (usando índices)
    if (filtros.operacao_id) {
      where.id_operacao = filtros.operacao_id;
    }

    if (filtros.limite_id) {
      where.id_limite = filtros.limite_id; // Índice: idx_recordes_id_limite
    }

    if (filtros.sistema_id) {
      where.id_sistema = filtros.sistema_id; // Índice: idx_recordes_id_sistema
    }

    // Construir includes com filtros opcionais nos relacionamentos
    const includes = [];

    // Include de operação (sempre necessário)
    const operacaoInclude = {
      association: "operacao",
      required: true,
      attributes: ["id", "nome", "descricao", "tipo", "ordem", "id_plano"],
    };

    // Filtrar por tipo de operação se fornecido
    if (filtros.tipo_operacao) {
      operacaoInclude.where = {
        tipo: filtros.tipo_operacao,
      };
    }

    // Filtrar por plano se fornecido (aplicado na operação)
    if (filtros.plano_id) {
      if (!operacaoInclude.where) {
        operacaoInclude.where = {};
      }
      operacaoInclude.where.id_plano = filtros.plano_id;
    }

    includes.push(operacaoInclude);

    // Include de limite (sempre necessário)
    includes.push({
      association: "limite",
      required: true,
      attributes: ["id", "descricao", "tempo", "id_plano"],
    });

    // Include de sistema (sempre necessário)
    includes.push({
      association: "sistema",
      required: true,
      attributes: ["id", "descricao", "tipo", "id_plano"],
    });

    // Buscar recordes com relacionamentos (evitando N+1 queries)
    const recordes = await Recorde.findAll({
      where,
      attributes: [
        "id",
        "id_usuario",
        "id_operacao",
        "id_limite",
        "id_sistema",
        "total",
        "erros",
        "quantidade",
        "data_recorde",
        "criado_em",
        "atualizado_em",
        "criado_por",
        "atualizado_por",
      ],
      include: includes,
      // Ordenar por: ordem da operação, id do sistema, tempo limite
      // Usar Sequelize.literal para evitar ambiguidade em JOINs
      order: [
        [Sequelize.literal("`operacao`.`ordem`"), "ASC"],
        [Sequelize.literal("`sistema`.`id`"), "ASC"],
        [Sequelize.literal("`limite`.`tempo`"), "ASC"],
      ],
    });

    return recordes;
  }

  /**
   * Obtém um recorde específico por ID
   * @param {number} recordId - ID do recorde
   * @param {number} usuarioId - ID do usuário (para verificar propriedade)
   * @returns {Promise<Object>} Recorde completo
   */
  async obterRecorde(recordId, usuarioId) {
    // Buscar recorde com todos os relacionamentos (evitando N+1 queries)
    // Selecionar apenas campos necessários para otimizar
    const recorde = await Recorde.findByPk(recordId, {
      attributes: [
        "id",
        "id_usuario",
        "id_operacao",
        "id_limite",
        "id_sistema",
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
          association: "usuario",
          required: true,
          attributes: ["id", "nome", "email", "tipo", "id_plano"],
        },
        {
          association: "operacao",
          required: true,
          attributes: ["id", "nome", "descricao", "tipo", "ordem", "id_plano"],
        },
        {
          association: "limite",
          required: true,
          attributes: ["id", "descricao", "tempo", "id_plano"],
        },
        {
          association: "sistema",
          required: true,
          attributes: ["id", "descricao", "tipo", "id_plano"],
        },
      ],
    });

    if (!recorde) {
      throw new Error("Recorde não encontrado");
    }

    // Verificar que o recorde pertence ao usuário
    if (recorde.id_usuario !== usuarioId) {
      throw new Error("Recorde não pertence ao usuário");
    }

    return recorde;
  }

  /**
   * Lista os últimos N recordes batidos (de todos os usuários), ordenados por data
   * Útil para exibir avisos de recordes recentes na página de recordes
   * @param {number} limite - Quantidade máxima de recordes (padrão: 20)
   * @returns {Promise<Array>} Array de recordes com usuário, operação, limite e sistema
   */
  async listarUltimosRecordesBatidos(limite = 20) {
    const recordes = await Recorde.findAll({
      where: {
        total: { [Op.gt]: 0 }, // Apenas recordes reais (exclui placeholders com total=0)
        id_usuario: { [Op.gt]: 0 }, // Excluir visitantes (id 0)
      },
      attributes: [
        "id",
        "id_usuario",
        "id_operacao",
        "id_limite",
        "id_sistema",
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
          association: "operacao",
          required: true,
          attributes: ["id", "nome", "tipo"],
        },
        {
          association: "limite",
          required: true,
          attributes: ["id", "descricao"],
        },
        {
          association: "sistema",
          required: true,
          attributes: ["id", "descricao", "tipo"],
        },
      ],
      order: [["data_recorde", "DESC"]],
      limit: Math.min(limite, 100),
    });

    return recordes;
  }
}

module.exports = new RecordeService();
