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
   * Verifica se existe recorde e salva/atualiza conforme necessário
   * @param {number} usuarioId - ID do usuário
   * @param {number} operacaoId - ID da operação
   * @param {number} limiteId - ID do limite
   * @param {number} sistemaId - ID do sistema
   * @param {number} total - Total de acertos
   * @returns {Promise<Object>} Objeto com informações sobre a operação
   */
  async verificarESalvarRecorde(
    usuarioId,
    operacaoId,
    limiteId,
    sistemaId,
    total
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
    const recordeExistente = await Recorde.findOne({
      where: {
        id_usuario: usuarioIdNum, // Índice: idx_recordes_unique
        id_operacao: operacaoIdNum, // Índice: idx_recordes_unique
        id_limite: limiteIdNum, // Índice: idx_recordes_unique
        id_sistema: sistemaIdNum, // Índice: idx_recordes_unique
      },
      attributes: ["id", "total", "atualizado_em"], // Selecionar apenas campos necessários
    });

    // Data atual no horário do Brasil (UTC-3)
    // O Sequelize já está configurado com timezone "-03:00", então new Date() será tratado corretamente
    const dataAtual = new Date();

    let criado = false;
    let atualizado = false;
    let bateuRecorde = false;
    let recordeAnterior = null;

    if (!recordeExistente) {
      // Tentar criar novo recorde
      // Se falhar por constraint única (race condition), buscar e atualizar
      try {
        await Recorde.create({
          id_usuario: usuarioIdNum,
          id_operacao: operacaoIdNum,
          id_limite: limiteIdNum,
          id_sistema: sistemaIdNum,
          total: total,
          criado_em: dataAtual,
          criado_por: usuarioIdNum,
          atualizado_em: dataAtual, // Preencher atualizado_em mesmo na criação
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
            attributes: ["id", "total", "atualizado_em"],
          });

          if (recordeCriado) {
            // Verificar se bateu recorde
            if (total > recordeCriado.total) {
              recordeAnterior = {
                total: recordeCriado.total,
                atualizado_em: recordeCriado.atualizado_em,
              };

              await recordeCriado.update({
                total: total,
                atualizado_em: dataAtual,
                atualizado_por: usuarioIdNum,
              });

              atualizado = true;
              bateuRecorde = true;
            } else {
              recordeAnterior = {
                total: recordeCriado.total,
                atualizado_em: recordeCriado.atualizado_em,
              };
              bateuRecorde = false;
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
      // Verificar se bateu recorde
      if (total > recordeExistente.total) {
        // Salvar recorde anterior antes de atualizar
        recordeAnterior = {
          total: recordeExistente.total,
          atualizado_em: recordeExistente.atualizado_em,
        };

        // Atualizar recorde
        await recordeExistente.update({
          total: total,
          atualizado_em: dataAtual, // Data do novo recorde
          atualizado_por: usuarioIdNum,
        });

        atualizado = true;
        bateuRecorde = true;
      } else {
        // Não bateu recorde, não fazer nada
        recordeAnterior = {
          total: recordeExistente.total,
          atualizado_em: recordeExistente.atualizado_em,
        };
        bateuRecorde = false;
      }
    }

    return {
      criado,
      atualizado,
      bateuRecorde,
      recordeAnterior: recordeAnterior ? recordeAnterior : null,
    };
  }

  /**
   * Lista recordes do usuário com filtros opcionais
   * @param {number} usuarioId - ID do usuário
   * @param {Object} filtros - Filtros opcionais (limite_id, sistema_id)
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
    // NOTA: Os filtros de limite_id e sistema_id já garantem que apenas recordes
    // de recursos acessíveis no plano atual serão retornados, pois o frontend
    // só permite selecionar limites/sistemas do plano atual. Se o usuário mudou
    // de plano, seus recordes antigos ainda são válidos e serão exibidos quando
    // ele filtrar por limites/sistemas que tem acesso.
    if (filtros.limite_id) {
      where.id_limite = filtros.limite_id; // Índice: idx_recordes_id_limite
    }

    if (filtros.sistema_id) {
      where.id_sistema = filtros.sistema_id; // Índice: idx_recordes_id_sistema
    }

    // Buscar recordes com relacionamentos (evitando N+1 queries)
    // Selecionar apenas campos necessários para otimizar
    // NOTA: Não filtramos por plano aqui porque:
    // - Se o usuário mudou de plano, seus recordes antigos ainda são válidos
    // - Os filtros de limite/sistema já garantem que só aparecerão recordes de recursos acessíveis
    // - A operação pode ser de qualquer plano (o recorde já foi criado quando tinha acesso)
    const recordes = await Recorde.findAll({
      where,
      attributes: [
        "id",
        "id_usuario",
        "id_operacao",
        "id_limite",
        "id_sistema",
        "total",
        "criado_em",
        "atualizado_em",
        "criado_por",
        "atualizado_por",
      ],
      include: [
        {
          association: "operacao",
          required: true,
          attributes: ["id", "nome", "descricao", "tipo", "id_plano"],
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
      // Ordenar por operação (ordem), limite, sistema (usando índices)
      // Usar Sequelize.literal para especificar explicitamente a tabela do sistema
      // Isso evita ambiguidade com o campo 'tipo' da operação
      order: [
        [{ association: "operacao" }, "ordem", "ASC"],
        [{ association: "limite" }, "tempo", "ASC"],
        [Sequelize.literal("`sistema`.`tipo`"), "ASC"],
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
}

module.exports = new RecordeService();
