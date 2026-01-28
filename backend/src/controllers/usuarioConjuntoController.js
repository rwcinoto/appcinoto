"use strict";

const { validationResult } = require("express-validator");
const { Conjunto, UsuarioConjunto, Usuario, Plano } = require("../models");
const { Op, Sequelize } = require("sequelize");

class UsuarioConjuntoController {
  /**
   * Listar usuários de um conjunto
   * Apenas dono/admin podem ver
   * Incluir informações: nome, email, tipo, status
   * Ordenar por tipo (dono, admin, comum) e nome
   */
  async listarUsuarios(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId)) {
        return res.status(400).json({ message: "ID do conjunto inválido" });
      }

      // Verificar se conjunto existe
      const conjunto = await Conjunto.findByPk(conjuntoId);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário é dono ou admin
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
          status: "aceito",
          tipo: { [Op.in]: ["dono", "admin"] },
        },
      });

      if (!usuarioConjunto) {
        return res.status(403).json({
          message: "Acesso negado. Apenas dono ou admin podem ver os usuários do conjunto.",
        });
      }

      // Buscar todos os usuários do conjunto
      const usuariosConjuntos = await UsuarioConjunto.findAll({
        where: {
          id_conjunto: conjuntoId,
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nome"],
          },
        ],
        order: [
          // Ordenar por tipo: dono primeiro, depois admin, depois comum
          // Usar o alias do modelo (UsuarioConjunto) ao invés do nome da tabela
          [
            Sequelize.literal(
              "CASE WHEN `UsuarioConjunto`.`tipo` = 'dono' THEN 1 WHEN `UsuarioConjunto`.`tipo` = 'admin' THEN 2 ELSE 3 END"
            ),
            "ASC",
          ],
          [{ model: Usuario, as: "usuario" }, "nome", "ASC"],
        ],
      });

      // Preparar resposta
      const usuarios = usuariosConjuntos.map((uc) => ({
        id: uc.usuario.id,
        nome: uc.usuario.nome,
        tipo: uc.tipo,
        status: uc.status,
      }));

      return res.json(usuarios);
    } catch (error) {
      console.error("Erro ao listar usuários do conjunto:", error);
      return res.status(500).json({
        message: "Erro ao listar usuários do conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Convidar usuário para conjunto
   * Dono ou admin podem convidar
   * Receber email do usuário
   * Validar que email existe no sistema
   * Validar que usuário não está já no conjunto
   * Validar limite conjuntos_participar do usuário convidado
   * Criar registro com status='pendente', tipo='comum'
   * Preencher criado_por
   */
  async convidar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const { email } = req.body;
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId)) {
        return res.status(400).json({ message: "ID do conjunto inválido" });
      }

      if (!email || email.trim() === "") {
        return res.status(400).json({ message: "Email é obrigatório" });
      }

      // Verificar se conjunto existe e está ativo
      const conjunto = await Conjunto.findByPk(conjuntoId);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      if (!conjunto.ativo) {
        return res.status(400).json({ message: "Conjunto está inativo" });
      }

      // Verificar se usuário logado é dono ou admin
      const usuarioConjuntoLogado = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
          status: "aceito",
          tipo: { [Op.in]: ["dono", "admin"] },
        },
      });

      if (!usuarioConjuntoLogado) {
        return res.status(403).json({
          message: "Acesso negado. Apenas dono ou admin podem convidar usuários.",
        });
      }

      // Validar que email existe no sistema
      const usuarioConvidado = await Usuario.findOne({
        where: { email: email.trim() },
        include: [{ association: "plano" }],
      });

      if (!usuarioConvidado) {
        return res.status(404).json({ message: "Usuário não encontrado" });
      }

      // Validar que usuário não está já no conjunto
      const usuarioJaNoConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioConvidado.id,
        },
      });

      if (usuarioJaNoConjunto) {
        return res.status(400).json({
          message: "Usuário já está no conjunto ou já foi convidado",
        });
      }

      // Validar limite conjuntos_participar do usuário convidado
      const planoConvidado = usuarioConvidado.plano;

      if (!planoConvidado) {
        return res.status(400).json({
          message: "Plano do usuário convidado não encontrado",
        });
      }

      // Contar conjuntos onde usuário participa (status 'aceito')
      const usuariosConjuntosParticipando = await UsuarioConjunto.findAll({
        where: {
          id_usuario: usuarioConvidado.id,
          status: "aceito",
        },
        attributes: ["id_conjunto"],
      });

      const idsConjuntosParticipando = usuariosConjuntosParticipando.map(
        (uc) => uc.id_conjunto
      );

      const conjuntosParticipando = idsConjuntosParticipando.length > 0
        ? await Conjunto.count({
            where: {
              id: { [Op.in]: idsConjuntosParticipando },
              ativo: true,
            },
          })
        : 0;

      if (
        planoConvidado.conjuntos_participar > 0 &&
        conjuntosParticipando >= planoConvidado.conjuntos_participar
      ) {
        return res.status(403).json({
          message: `Usuário convidado atingiu o limite de participação em conjuntos. O plano permite participar de até ${planoConvidado.conjuntos_participar} conjunto(s).`,
        });
      }

      // Criar registro com status='pendente', tipo='comum'
      const novoUsuarioConjunto = await UsuarioConjunto.create({
        id_conjunto: conjuntoId,
        id_usuario: usuarioConvidado.id,
        tipo: "comum",
        status: "pendente",
        criado_por: usuarioId,
        atualizado_por: usuarioId,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      // Retornar informações do convite
      return res.status(201).json({
        id: novoUsuarioConjunto.id,
        id_conjunto: novoUsuarioConjunto.id_conjunto,
        id_usuario: novoUsuarioConjunto.id_usuario,
        tipo: novoUsuarioConjunto.tipo,
        status: novoUsuarioConjunto.status,
        usuario: {
          id: usuarioConvidado.id,
          nome: usuarioConvidado.nome,
        },
      });
    } catch (error) {
      console.error("Erro ao convidar usuário:", error);
      return res.status(500).json({
        message: "Erro ao convidar usuário",
        error: error.message,
      });
    }
  }

  /**
   * Atualizar tipo de usuário no conjunto
   * Apenas dono pode alterar tipo
   * Permitir alterar para 'admin' ou 'comum'
   * Não permitir alterar tipo do dono
   * Preencher atualizado_por
   */
  async atualizarTipo(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioIdAlvo = parseInt(req.params.usuario_id || req.params.usuarioConjuntoId);
      const { tipo } = req.body;
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId) || isNaN(usuarioIdAlvo)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Validar tipo
      if (!tipo || !["admin", "comum"].includes(tipo)) {
        return res.status(400).json({
          message: "Tipo inválido. Deve ser 'admin' ou 'comum'",
        });
      }

      // Verificar se conjunto existe
      const conjunto = await Conjunto.findByPk(conjuntoId);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário logado é dono
      const usuarioConjuntoLogado = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
          status: "aceito",
          tipo: "dono",
        },
      });

      if (!usuarioConjuntoLogado) {
        return res.status(403).json({
          message: "Acesso negado. Apenas o dono pode alterar o tipo de usuário.",
        });
      }

      // Buscar registro a ser alterado usando conjunto_id e usuario_id
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioIdAlvo,
        },
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nome"],
          },
        ],
      });

      if (!usuarioConjunto) {
        return res.status(404).json({
          message: "Usuário não encontrado neste conjunto",
        });
      }

      // Não permitir alterar tipo do dono
      if (usuarioConjunto.tipo === "dono") {
        return res.status(400).json({
          message: "Não é possível alterar o tipo do dono do conjunto",
        });
      }

      // Atualizar tipo
      await usuarioConjunto.update({
        tipo: tipo,
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({
        id: usuarioConjunto.id,
        id_conjunto: usuarioConjunto.id_conjunto,
        id_usuario: usuarioConjunto.id_usuario,
        tipo: usuarioConjunto.tipo,
        status: usuarioConjunto.status,
        usuario: {
          id: usuarioConjunto.usuario.id,
          nome: usuarioConjunto.usuario.nome,
        },
      });
    } catch (error) {
      console.error("Erro ao atualizar tipo de usuário:", error);
      return res.status(500).json({
        message: "Erro ao atualizar tipo de usuário",
        error: error.message,
      });
    }
  }

  /**
   * Remover usuário do conjunto
   * Dono e admin podem remover
   * Não permitir remover dono (ou apenas se excluir conjunto)
   * Remover registro de usuarios_conjuntos
   */
  async remover(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioIdAlvo = parseInt(req.params.usuario_id || req.params.usuarioConjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId) || isNaN(usuarioIdAlvo)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Verificar se conjunto existe
      const conjunto = await Conjunto.findByPk(conjuntoId);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário logado é dono ou admin
      const usuarioConjuntoLogado = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
          status: "aceito",
          tipo: { [Op.in]: ["dono", "admin"] },
        },
      });

      if (!usuarioConjuntoLogado) {
        return res.status(403).json({
          message: "Acesso negado. Apenas dono ou admin podem remover usuários.",
        });
      }

      // Buscar registro a ser removido usando conjunto_id e usuario_id
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioIdAlvo,
        },
      });

      if (!usuarioConjunto) {
        return res.status(404).json({
          message: "Usuário não encontrado neste conjunto",
        });
      }

      // Não permitir remover dono
      if (usuarioConjunto.tipo === "dono") {
        return res.status(400).json({
          message: "Não é possível remover o dono do conjunto",
        });
      }

      // Remover registro
      await usuarioConjunto.destroy();

      return res.json({ message: "Usuário removido do conjunto com sucesso" });
    } catch (error) {
      console.error("Erro ao remover usuário do conjunto:", error);
      return res.status(500).json({
        message: "Erro ao remover usuário do conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Aceitar convite
   * Usuário pode aceitar próprio convite
   * Validar que convite existe e está pendente
   * Validar limite conjuntos_participar do usuário
   * Atualizar status para 'aceito'
   * Preencher atualizado_por
   */
  async aceitarConvite(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioIdAlvo = parseInt(req.params.usuario_id || req.params.usuarioConjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId) || isNaN(usuarioIdAlvo)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Verificar que o usuário alvo é o usuário logado
      if (usuarioIdAlvo !== usuarioId) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode aceitar seus próprios convites.",
        });
      }

      // Buscar convite usando conjunto_id e usuario_id
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
        },
        include: [
          {
            model: Conjunto,
            as: "conjunto",
          },
        ],
      });

      if (!usuarioConjunto) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      // Validar que convite está pendente
      if (usuarioConjunto.status !== "pendente") {
        return res.status(400).json({
          message: "Convite já foi aceito ou rejeitado",
        });
      }

      // Verificar se conjunto está ativo
      if (!usuarioConjunto.conjunto.ativo) {
        return res.status(400).json({
          message: "Conjunto está inativo",
        });
      }

      // Validar limite conjuntos_participar do usuário
      const usuario = await Usuario.findByPk(usuarioId, {
        include: [{ association: "plano" }],
      });

      if (!usuario || !usuario.plano) {
        return res.status(400).json({
          message: "Plano do usuário não encontrado",
        });
      }

      const plano = usuario.plano;

      // Contar conjuntos onde usuário participa (status 'aceito')
      const usuariosConjuntosParticipando = await UsuarioConjunto.findAll({
        where: {
          id_usuario: usuarioId,
          status: "aceito",
        },
        attributes: ["id_conjunto"],
      });

      const idsConjuntosParticipando = usuariosConjuntosParticipando.map(
        (uc) => uc.id_conjunto
      );

      const conjuntosParticipando = idsConjuntosParticipando.length > 0
        ? await Conjunto.count({
            where: {
              id: { [Op.in]: idsConjuntosParticipando },
              ativo: true,
            },
          })
        : 0;

      if (
        plano.conjuntos_participar > 0 &&
        conjuntosParticipando >= plano.conjuntos_participar
      ) {
        return res.status(403).json({
          message: `Limite de participação em conjuntos atingido. Seu plano permite participar de até ${plano.conjuntos_participar} conjunto(s).`,
        });
      }

      // Atualizar status para 'aceito'
      await usuarioConjunto.update({
        status: "aceito",
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({
        id: usuarioConjunto.id,
        id_conjunto: usuarioConjunto.id_conjunto,
        id_usuario: usuarioConjunto.id_usuario,
        tipo: usuarioConjunto.tipo,
        status: usuarioConjunto.status,
        conjunto: {
          id: usuarioConjunto.conjunto.id,
          nome: usuarioConjunto.conjunto.nome,
        },
      });
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      return res.status(500).json({
        message: "Erro ao aceitar convite",
        error: error.message,
      });
    }
  }

  /**
   * Rejeitar convite
   * Usuário pode rejeitar próprio convite
   * Validar que convite existe e está pendente
   * Atualizar status para 'rejeitado' (ou excluir registro)
   * Preencher atualizado_por
   */
  async rejeitarConvite(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioIdAlvo = parseInt(req.params.usuario_id || req.params.usuarioConjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId) || isNaN(usuarioIdAlvo)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Verificar que o usuário alvo é o usuário logado
      if (usuarioIdAlvo !== usuarioId) {
        return res.status(403).json({
          message: "Acesso negado. Você só pode rejeitar seus próprios convites.",
        });
      }

      // Buscar convite usando conjunto_id e usuario_id
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
        },
      });

      if (!usuarioConjunto) {
        return res.status(404).json({ message: "Convite não encontrado" });
      }

      // Validar que convite está pendente
      if (usuarioConjunto.status !== "pendente") {
        return res.status(400).json({
          message: "Convite já foi aceito ou rejeitado",
        });
      }

      // Atualizar status para 'rejeitado'
      await usuarioConjunto.update({
        status: "rejeitado",
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({ message: "Convite rejeitado com sucesso" });
    } catch (error) {
      console.error("Erro ao rejeitar convite:", error);
      return res.status(500).json({
        message: "Erro ao rejeitar convite",
        error: error.message,
      });
    }
  }

  /**
   * Sair do conjunto
   * Permite que elementos do tipo 'comum' ou 'admin' saiam do conjunto
   * Muda o status para 'rejeitado'
   * Não permite que o dono saia (deve excluir o conjunto)
   */
  async sairConjunto(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId)) {
        return res.status(400).json({ message: "ID do conjunto inválido" });
      }

      // Buscar registro do usuário no conjunto
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
        },
      });

      if (!usuarioConjunto) {
        return res.status(404).json({ message: "Você não pertence a este conjunto" });
      }

      // Validar que o usuário não é dono
      if (usuarioConjunto.tipo === "dono") {
        return res.status(400).json({
          message: "O dono não pode sair do conjunto. Use a opção 'Excluir conjunto' se desejar remover o conjunto.",
        });
      }

      // Validar que o status é 'aceito' (elemento ativo)
      if (usuarioConjunto.status !== "aceito") {
        return res.status(400).json({
          message: "Você não está ativo neste conjunto",
        });
      }

      // Atualizar status para 'rejeitado'
      await usuarioConjunto.update({
        status: "rejeitado",
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({ message: "Você saiu do conjunto com sucesso" });
    } catch (error) {
      console.error("Erro ao sair do conjunto:", error);
      return res.status(500).json({
        message: "Erro ao sair do conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Reenviar convite
   * Permite que dono/admin reenvie convite para elementos com status 'rejeitado'
   * Muda o status de 'rejeitado' para 'pendente'
   */
  async reenviarConvite(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const conjuntoId = parseInt(req.params.conjunto_id || req.params.conjuntoId);
      const usuarioIdAlvo = parseInt(req.params.usuario_id || req.params.usuarioConjuntoId);
      const usuarioId = req.usuario.id;

      if (isNaN(conjuntoId) || isNaN(usuarioIdAlvo)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Verificar se conjunto existe
      const conjunto = await Conjunto.findByPk(conjuntoId);
      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário logado é dono ou admin do conjunto
      const usuarioConjuntoLogado = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioId,
          status: "aceito",
          tipo: { [Op.in]: ["dono", "admin"] },
        },
      });

      if (!usuarioConjuntoLogado) {
        return res.status(403).json({
          message: "Acesso negado. Apenas dono ou admin podem reenviar convites.",
        });
      }

      // Buscar registro do usuário alvo no conjunto
      const usuarioConjuntoAlvo = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: conjuntoId,
          id_usuario: usuarioIdAlvo,
        },
      });

      if (!usuarioConjuntoAlvo) {
        return res.status(404).json({ message: "Usuário não encontrado neste conjunto" });
      }

      // Validar que o status é 'rejeitado'
      if (usuarioConjuntoAlvo.status !== "rejeitado") {
        return res.status(400).json({
          message: "Apenas convites rejeitados podem ser reenviados",
        });
      }

      // Validar que não é o dono
      if (usuarioConjuntoAlvo.tipo === "dono") {
        return res.status(400).json({
          message: "Não é possível reenviar convite para o dono do conjunto",
        });
      }

      // Atualizar status para 'pendente'
      await usuarioConjuntoAlvo.update({
        status: "pendente",
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({ message: "Convite reenviado com sucesso" });
    } catch (error) {
      console.error("Erro ao reenviar convite:", error);
      return res.status(500).json({
        message: "Erro ao reenviar convite",
        error: error.message,
      });
    }
  }

  /**
   * Listar convites pendentes do usuário logado
   * Incluir informações do conjunto e quem convidou
   * Retornar apenas status='pendente'
   */
  async listarConvitesPendentes(req, res) {
    try {
      const usuarioId = req.usuario.id;

      // Buscar convites pendentes do usuário
      const convites = await UsuarioConjunto.findAll({
        where: {
          id_usuario: usuarioId,
          status: "pendente",
        },
        include: [
          {
            model: Conjunto,
            as: "conjunto",
            where: {
              ativo: true,
            },
            required: true,
          },
          {
            model: Usuario,
            as: "usuario",
            attributes: [],
            required: false,
          },
        ],
      });

      // Preparar resposta com informações do conjunto e quem convidou
      const convitesFormatados = await Promise.all(
        convites.map(async (convite) => {
          // Buscar quem convidou (criado_por)
          let quemConvidou = null;
          if (convite.criado_por && !isNaN(convite.criado_por) && convite.criado_por > 0) {
            try {
              const usuarioConvidou = await Usuario.findByPk(Number(convite.criado_por), {
                attributes: ["id", "nome"],
              });
              if (usuarioConvidou) {
                quemConvidou = {
                  id: usuarioConvidou.id,
                  nome: usuarioConvidou.nome,
                };
              }
            } catch (error) {
              console.error("Erro ao buscar usuário que convidou:", error);
              // Continua sem o quem_convidou se houver erro
            }
          }

          return {
            id: convite.id,
            id_conjunto: convite.id_conjunto,
            id_usuario: convite.id_usuario,
            tipo: convite.tipo,
            status: convite.status,
            criado_em: convite.criado_em,
            conjunto: {
              id: convite.conjunto.id,
              nome: convite.conjunto.nome,
            },
            quem_convidou: quemConvidou,
          };
        })
      );

      return res.json(convitesFormatados);
    } catch (error) {
      console.error("Erro ao listar convites pendentes:", error);
      return res.status(500).json({
        message: "Erro ao listar convites pendentes",
        error: error.message,
      });
    }
  }
}

module.exports = new UsuarioConjuntoController();

