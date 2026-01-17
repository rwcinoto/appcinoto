"use strict";

const {
  Recorde,
  Usuario,
  Operacao,
  Limite,
  Sistema,
  Conjunto,
  UsuarioConjunto,
} = require("../models");
const { Op, Sequelize } = require("sequelize");

class RankingService {
  /**
   * Obtém ranking unificado (global ou por conjunto)
   * @param {Object} filtros - Filtros: operacao_id, limite_id, sistema_id, conjunto_id (opcional)
   * @param {number} usuarioId - ID do usuário logado
   * @returns {Promise<Object>} Objeto com ranking, posição do usuário e total de participantes
   */
  async obterRanking(filtros, usuarioId) {
    // Validar filtros obrigatórios
    if (!filtros.operacao_id || !filtros.limite_id || !filtros.sistema_id) {
      throw new Error(
        "Filtros obrigatórios: operacao_id, limite_id, sistema_id"
      );
    }

    // Validar que operacao, limite e sistema existem
    const [operacao, limite, sistema] = await Promise.all([
      Operacao.findByPk(filtros.operacao_id, {
        attributes: ["id", "nome"],
      }),
      Limite.findByPk(filtros.limite_id, {
        attributes: ["id", "descricao"],
      }),
      Sistema.findByPk(filtros.sistema_id, {
        attributes: ["id", "tipo"],
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

    // Se conjunto_id fornecido, validar que usuário pertence ao conjunto
    let usuariosConjuntoIds = null;
    if (filtros.conjunto_id) {
      // Validar que conjunto existe
      const conjunto = await Conjunto.findByPk(filtros.conjunto_id, {
        attributes: ["id", "ativo"],
      });

      if (!conjunto) {
        throw new Error("Conjunto não encontrado");
      }

      if (!conjunto.ativo) {
        throw new Error("Conjunto inativo");
      }

      // Validar que usuário pertence ao conjunto com status 'aceito'
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

      // Buscar IDs de todos os usuários do conjunto com status 'aceito'
      const usuariosConjunto = await UsuarioConjunto.findAll({
        where: {
          id_conjunto: filtros.conjunto_id,
          status: "aceito",
        },
        attributes: ["id_usuario"],
      });

      usuariosConjuntoIds = usuariosConjunto.map((uc) => uc.id_usuario);
    }

    // Construir condições de busca para recordes
    const whereRecorde = {
      id_operacao: filtros.operacao_id,
      id_limite: filtros.limite_id,
      id_sistema: filtros.sistema_id,
    };

    // Se ranking por conjunto, filtrar apenas usuários do conjunto
    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = {
        [Op.in]: usuariosConjuntoIds,
      };
    }

    // Construir where do usuário
    // Para rankings globais (sem conjunto_id), filtrar apenas usuários com ranking_global = true
    // Para rankings de conjunto, mostrar todos (ranking privado)
    const whereUsuario = {
      ativo: true, // Apenas usuários ativos
    };

    // Se for ranking global (sem conjunto_id), filtrar por ranking_global
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    // Contar total de participantes usando COUNT (mais eficiente que buscar todos)
    // Usar índice composto (idx_recordes_ranking) para otimização
    const totalParticipantes = await Recorde.count({
      where: whereRecorde,
      include: [
        {
          association: "usuario",
          required: true,
          where: whereUsuario,
        },
      ],
      distinct: true,
      col: "id_usuario", // Contar usuários únicos
    });

    // Buscar apenas top 100 recordes (usar LIMIT no banco ao invés de slice)
    // Como há índice único composto (id_usuario, id_operacao, id_limite, id_sistema),
    // cada usuário terá no máximo um recorde para esta combinação
    // Usar índice composto (idx_recordes_ranking) para otimização
    // O índice (id_operacao, id_limite, id_sistema, total DESC) será usado para WHERE e ORDER BY
    const recordesOrdenados = await Recorde.findAll({
      where: whereRecorde,
      attributes: ["id_usuario", "total", "quantidade", "atualizado_em"],
      include: [
        {
          association: "usuario",
          required: true,
          where: whereUsuario,
          attributes: ["id", "nome", "ativo"],
        },
      ],
      // Ordenar por total DESC, atualizado_em ASC (maior pontuação, mais antiga em caso de empate)
      // O índice (id_operacao, id_limite, id_sistema, total DESC) será usado parcialmente
      order: [
        ["total", "DESC"],
        ["quantidade", "ASC"], // Menos treinos em caso de empate
        ["atualizado_em", "ASC"], // Mais antiga em caso de empate
      ],
      limit: 100, // Limitar no banco ao invés de slice no JavaScript
    });

    // Montar ranking com posições
    const ranking = recordesOrdenados.map((recorde, index) => ({
      posicao: index + 1,
      id_usuario: recorde.id_usuario,
      nome: recorde.usuario.nome,
      total: recorde.total,
      quantidade: recorde.quantidade,
      data_recorde: recorde.atualizado_em,
    }));

    // Calcular posição do usuário logado (mesmo se não estiver nos 100)
    const posicaoUsuario = await this.obterPosicaoUsuario(filtros, usuarioId);

    return {
      ranking,
      posicaoUsuario: posicaoUsuario,
      totalParticipantes,
    };
  }

  /**
   * Calcula posição exata do usuário no ranking filtrado
   * @param {Object} filtros - Filtros: operacao_id, limite_id, sistema_id, conjunto_id (opcional)
   * @param {number} usuarioId - ID do usuário
   * @returns {Promise<number|null>} Posição (1-based) ou null se não tem recorde
   */
  async obterPosicaoUsuario(filtros, usuarioId) {
    // Validar filtros obrigatórios
    if (!filtros.operacao_id || !filtros.limite_id || !filtros.sistema_id) {
      throw new Error(
        "Filtros obrigatórios: operacao_id, limite_id, sistema_id"
      );
    }

    // Se conjunto_id fornecido, validar e filtrar
    let usuariosConjuntoIds = null;
    if (filtros.conjunto_id) {
      // Validar que conjunto existe
      const conjunto = await Conjunto.findByPk(filtros.conjunto_id, {
        attributes: ["id", "ativo"],
      });

      if (!conjunto || !conjunto.ativo) {
        throw new Error("Conjunto não encontrado ou inativo");
      }

      // Buscar IDs de todos os usuários do conjunto com status 'aceito'
      const usuariosConjunto = await UsuarioConjunto.findAll({
        where: {
          id_conjunto: filtros.conjunto_id,
          status: "aceito",
        },
        attributes: ["id_usuario"],
      });

      usuariosConjuntoIds = usuariosConjunto.map((uc) => uc.id_usuario);
    }

    // Construir where do usuário para buscar o recorde
    // Para rankings globais (sem conjunto_id), verificar se usuário tem ranking_global = true
    const whereUsuarioRecorde = {
      ativo: true,
    };

    // Se for ranking global (sem conjunto_id), verificar ranking_global
    if (usuariosConjuntoIds === null) {
      whereUsuarioRecorde.ranking_global = true;
    }

    // Buscar recorde do usuário para obter total e data
    const recordeUsuario = await Recorde.findOne({
      where: {
        id_usuario: usuarioId,
        id_operacao: filtros.operacao_id,
        id_limite: filtros.limite_id,
        id_sistema: filtros.sistema_id,
      },
      attributes: ["total", "atualizado_em"],
      include: [
        {
          association: "usuario",
          required: true,
          where: whereUsuarioRecorde,
        },
      ],
    });

    // Se não tem recorde ou não tem ranking_global = true (para rankings globais), retornar null
    if (!recordeUsuario) {
      return null;
    }

    // Construir condições de busca
    const whereRecorde = {
      id_operacao: filtros.operacao_id,
      id_limite: filtros.limite_id,
      id_sistema: filtros.sistema_id,
    };

    // Se ranking por conjunto, filtrar apenas usuários do conjunto
    if (usuariosConjuntoIds !== null) {
      whereRecorde.id_usuario = {
        [Op.in]: usuariosConjuntoIds,
      };
    }

    // Construir where do usuário
    // Para rankings globais (sem conjunto_id), filtrar apenas usuários com ranking_global = true
    // Para rankings de conjunto, mostrar todos (ranking privado)
    const whereUsuario = {
      ativo: true,
    };

    // Se for ranking global (sem conjunto_id), filtrar por ranking_global
    if (usuariosConjuntoIds === null) {
      whereUsuario.ranking_global = true;
    }

    // Contar quantos recordes têm total maior OU (total igual e data mais antiga)
    // Isso dá a posição do usuário no ranking
    // Usar índice composto (idx_recordes_ranking) para otimização
    const posicao = await Recorde.count({
      where: {
        ...whereRecorde,
        [Op.or]: [
          // Total maior
          { total: { [Op.gt]: recordeUsuario.total } },
          // Total igual e data mais antiga (atualizado_em menor)
          {
            total: recordeUsuario.total,
            atualizado_em: { [Op.lt]: recordeUsuario.atualizado_em },
          },
        ],
      },
      include: [
        {
          association: "usuario",
          required: true,
          where: whereUsuario,
        },
      ],
    });

    // Posição é base 1 (quantos estão à frente + 1)
    return posicao + 1;
  }
}

module.exports = new RankingService();

