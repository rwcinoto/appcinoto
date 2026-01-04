"use strict";

const { validationResult } = require("express-validator");
const { Conjunto, UsuarioConjunto, Usuario, Plano } = require("../models");
const { Op, Sequelize } = require("sequelize");

class ConjuntoController {
  /**
   * Listar conjuntos do usuário logado
   * Retorna apenas conjuntos onde o usuário participa com status 'aceito'
   * Inclui quantidade de elementos
   * Retorna apenas conjuntos ativos
   */
  async listar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const usuarioId = req.usuario.id;

      // Buscar conjuntos onde o usuário participa com status 'aceito'
      const usuariosConjuntos = await UsuarioConjunto.findAll({
        where: {
          id_usuario: usuarioId,
          status: "aceito",
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
        ],
      });

      // Preparar resposta com quantidade de elementos
      const conjuntos = await Promise.all(
        usuariosConjuntos.map(async (uc) => {
          const conjunto = uc.conjunto;

          // Contar elementos com status 'aceito'
          const quantidadeElementos = await UsuarioConjunto.count({
            where: {
              id_conjunto: conjunto.id,
              status: "aceito",
            },
          });

          return {
            id: conjunto.id,
            nome: conjunto.nome,
            ativo: conjunto.ativo,
            criado_em: conjunto.criado_em,
            criado_por: conjunto.criado_por,
            atualizado_em: conjunto.atualizado_em,
            atualizado_por: conjunto.atualizado_por,
            quantidade_elementos: quantidadeElementos,
            tipo: uc.tipo, // Tipo do usuário no conjunto
          };
        })
      );

      return res.json(conjuntos);
    } catch (error) {
      console.error("Erro ao listar conjuntos:", error);
      return res.status(500).json({
        message: "Erro ao listar conjuntos",
        error: error.message,
      });
    }
  }

  /**
   * Obter conjunto por ID
   * Verifica se usuário tem acesso (participa do conjunto)
   * Inclui lista de elementos com tipos
   */
  async obter(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const id = parseInt(req.params.id);
      const usuarioId = req.usuario.id;

      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Buscar conjunto
      const conjunto = await Conjunto.findByPk(id);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário tem acesso (participa do conjunto com status 'aceito')
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: id,
          id_usuario: usuarioId,
          status: "aceito",
        },
      });

      if (!usuarioConjunto) {
        return res.status(403).json({
          message: "Acesso negado. Você não participa deste conjunto.",
        });
      }

      // Buscar lista de elementos
      // Se usuário for do tipo 'comum', mostrar apenas elementos com status 'aceito'
      // Se for dono/admin, mostrar todos (incluindo pendentes e rejeitados)
      const whereClause = {
        id_conjunto: id,
      };

      // Se o usuário for do tipo 'comum', filtrar apenas aceitos
      if (usuarioConjunto.tipo === "comum") {
        whereClause.status = "aceito";
      }

      const elementos = await UsuarioConjunto.findAll({
        where: whereClause,
        include: [
          {
            model: Usuario,
            as: "usuario",
            attributes: ["id", "nome", "email"],
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
      const elementosFormatados = elementos.map((e) => ({
        id: e.usuario.id,
        nome: e.usuario.nome,
        email: e.usuario.email,
        tipo: e.tipo,
        status: e.status,
      }));

      return res.json({
        id: conjunto.id,
        nome: conjunto.nome,
        ativo: conjunto.ativo,
        criado_em: conjunto.criado_em,
        criado_por: conjunto.criado_por,
        atualizado_em: conjunto.atualizado_em,
        atualizado_por: conjunto.atualizado_por,
        elementos: elementosFormatados,
        meu_tipo: usuarioConjunto.tipo, // Tipo do usuário logado no conjunto
      });
    } catch (error) {
      console.error("Erro ao obter conjunto:", error);
      return res.status(500).json({
        message: "Erro ao obter conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Criar conjunto
   * Qualquer usuário pode criar
   * Validar limites do plano: conjuntos_criar e conjuntos_participar
   * Criar conjunto e registro em usuarios_conjuntos com tipo='dono', status='aceito'
   */
  async criar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { nome } = req.body;
      const usuarioId = req.usuario.id;

      // Validar nome obrigatório
      if (!nome || nome.trim() === "") {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }

      // Buscar usuário com plano
      const usuario = await Usuario.findByPk(usuarioId, {
        include: [{ association: "plano" }],
      });

      if (!usuario || !usuario.plano) {
        return res.status(400).json({ message: "Plano do usuário não encontrado" });
      }

      const plano = usuario.plano;

      // Validar limite conjuntos_criar (contar apenas conjuntos ativos onde usuário é dono)
      // Buscar IDs de conjuntos onde usuário é dono
      const usuariosConjuntosDono = await UsuarioConjunto.findAll({
        where: {
          id_usuario: usuarioId,
          tipo: "dono",
          status: "aceito",
        },
        attributes: ["id_conjunto"],
      });

      const idsConjuntosDono = usuariosConjuntosDono.map((uc) => uc.id_conjunto);

      // Contar apenas conjuntos ativos
      const conjuntosCriados = idsConjuntosDono.length > 0
        ? await Conjunto.count({
            where: {
              id: { [Op.in]: idsConjuntosDono },
              ativo: true,
            },
          })
        : 0;

      if (plano.conjuntos_criar > 0 && conjuntosCriados >= plano.conjuntos_criar) {
        return res.status(403).json({
          message: `Limite de conjuntos criados atingido. Seu plano permite criar até ${plano.conjuntos_criar} conjunto(s).`,
        });
      }

      // Validar limite conjuntos_participar (contar apenas conjuntos ativos com status 'aceito')
      // Buscar IDs de conjuntos onde usuário participa
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

      // Contar apenas conjuntos ativos
      const conjuntosParticipando = idsConjuntosParticipando.length > 0
        ? await Conjunto.count({
            where: {
              id: { [Op.in]: idsConjuntosParticipando },
              ativo: true,
            },
          })
        : 0;

      if (plano.conjuntos_participar > 0 && conjuntosParticipando >= plano.conjuntos_participar) {
        return res.status(403).json({
          message: `Limite de participação em conjuntos atingido. Seu plano permite participar de até ${plano.conjuntos_participar} conjunto(s).`,
        });
      }

      // Criar conjunto
      const conjunto = await Conjunto.create({
        nome: nome.trim(),
        ativo: true,
        criado_por: usuarioId,
        atualizado_por: usuarioId,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      // Criar registro em usuarios_conjuntos
      await UsuarioConjunto.create({
        id_conjunto: conjunto.id,
        id_usuario: usuarioId,
        tipo: "dono",
        status: "aceito",
        criado_por: usuarioId,
        atualizado_por: usuarioId,
        criado_em: new Date(),
        atualizado_em: new Date(),
      });

      // Retornar conjunto criado com quantidade de elementos
      const quantidadeElementos = 1; // Apenas o criador

      return res.status(201).json({
        id: conjunto.id,
        nome: conjunto.nome,
        ativo: conjunto.ativo,
        criado_em: conjunto.criado_em,
        criado_por: conjunto.criado_por,
        atualizado_em: conjunto.atualizado_em,
        atualizado_por: conjunto.atualizado_por,
        quantidade_elementos: quantidadeElementos,
        tipo: "dono",
      });
    } catch (error) {
      console.error("Erro ao criar conjunto:", error);
      return res.status(500).json({
        message: "Erro ao criar conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Atualizar conjunto
   * Apenas dono pode atualizar
   * Permitir editar apenas nome
   * Preencher atualizado_por
   */
  async atualizar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const id = parseInt(req.params.id);
      const usuarioId = req.usuario.id;

      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Buscar conjunto
      const conjunto = await Conjunto.findByPk(id);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário é dono
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: id,
          id_usuario: usuarioId,
          tipo: "dono",
          status: "aceito",
        },
      });

      if (!usuarioConjunto) {
        return res.status(403).json({
          message: "Acesso negado. Apenas o dono pode atualizar o conjunto.",
        });
      }

      // Validar nome
      const { nome } = req.body;

      if (nome === undefined) {
        return res.status(400).json({ message: "Nome é obrigatório" });
      }

      if (!nome || nome.trim() === "") {
        return res.status(400).json({ message: "Nome não pode ser vazio" });
      }

      // Atualizar conjunto
      await conjunto.update({
        nome: nome.trim(),
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      // Retornar conjunto atualizado
      return res.json({
        id: conjunto.id,
        nome: conjunto.nome,
        ativo: conjunto.ativo,
        criado_em: conjunto.criado_em,
        criado_por: conjunto.criado_por,
        atualizado_em: conjunto.atualizado_em,
        atualizado_por: conjunto.atualizado_por,
      });
    } catch (error) {
      console.error("Erro ao atualizar conjunto:", error);
      return res.status(500).json({
        message: "Erro ao atualizar conjunto",
        error: error.message,
      });
    }
  }

  /**
   * Excluir conjunto
   * Apenas dono pode excluir
   * Exclusão lógica (ativo=false)
   * Preencher atualizado_por
   */
  async excluir(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const id = parseInt(req.params.id);
      const usuarioId = req.usuario.id;

      if (isNaN(id)) {
        return res.status(400).json({ message: "ID inválido" });
      }

      // Buscar conjunto
      const conjunto = await Conjunto.findByPk(id);

      if (!conjunto) {
        return res.status(404).json({ message: "Conjunto não encontrado" });
      }

      // Verificar se usuário é dono
      const usuarioConjunto = await UsuarioConjunto.findOne({
        where: {
          id_conjunto: id,
          id_usuario: usuarioId,
          tipo: "dono",
          status: "aceito",
        },
      });

      if (!usuarioConjunto) {
        return res.status(403).json({
          message: "Acesso negado. Apenas o dono pode excluir o conjunto.",
        });
      }

      // Exclusão lógica
      await conjunto.update({
        ativo: false,
        atualizado_por: usuarioId,
        atualizado_em: new Date(),
      });

      return res.json({ message: "Conjunto excluído com sucesso" });
    } catch (error) {
      console.error("Erro ao excluir conjunto:", error);
      return res.status(500).json({
        message: "Erro ao excluir conjunto",
        error: error.message,
      });
    }
  }
}

module.exports = new ConjuntoController();

