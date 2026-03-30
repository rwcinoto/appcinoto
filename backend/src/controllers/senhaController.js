"use strict";

const { validationResult } = require("express-validator");
const { Usuario } = require("../models");
const treinoSenhaService = require("../services/treinoSenhaService");
const recordeSenhaService = require("../services/recordeSenhaService");

const treinosSenhaAtivos = new Map();
let proximoIdTreinoSenha = 1;

const LIMITE_TENTATIVAS = 20;

function gerarIdTreinoSenha() {
  return `treino_senha_${proximoIdTreinoSenha++}_${Date.now()}`;
}

function limparTreinosSenhaAntigos() {
  const umaHoraAtras = Date.now() - 60 * 60 * 1000;

  for (const [id, treino] of treinosSenhaAtivos.entries()) {
    if (treino.criadoEm < umaHoraAtras) {
      treinosSenhaAtivos.delete(id);
    }
  }
}

class SenhaController {
  /**
   * Iniciar treino de senha.
   *
   * Corpo esperado: digitos, tamanho, repeticao
   */
  async iniciarTreino(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { digitos, tamanho, repeticao } = req.body;
      const usuario = req.usuario;

      const digitosNum = parseInt(digitos);
      const tamanhoNum = parseInt(tamanho);
      const repeticaoNum = parseInt(repeticao) ? 1 : 0;

      const planoId = usuario.id_plano;
      const validacao = treinoSenhaService.validarOpcoes(
        digitosNum,
        tamanhoNum,
        repeticaoNum,
        planoId
      );

      if (!validacao.valido) {
        return res.status(403).json({ message: validacao.mensagem });
      }

      const senhaSecreta = treinoSenhaService.sortearSenha(
        digitosNum,
        tamanhoNum,
        repeticaoNum
      );

      const treinoId = gerarIdTreinoSenha();
      const treino = {
        id: treinoId,
        id_usuario: usuario.id,
        digitos: digitosNum,
        tamanho: tamanhoNum,
        repeticao: repeticaoNum,
        senhaSecreta,
        tentativas: [],
        inicio: null,
        acertou: false,
        tempoFinal: null,
        criadoEm: Date.now(),
      };

      treinosSenhaAtivos.set(treinoId, treino);
      limparTreinosSenhaAntigos();

      return res.json({
        treino_id: treinoId,
        digitos: digitosNum,
        tamanho: tamanhoNum,
        repeticao: repeticaoNum,
      });
    } catch (error) {
      console.error("Erro ao iniciar treino de senha:", error);
      return res.status(500).json({
        message: "Erro ao iniciar treino de senha",
        error: error.message,
      });
    }
  }

  /**
   * Confirmar início do treino (após contagem regressiva).
   *
   * Corpo esperado: treino_id
   */
  async confirmarInicio(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id } = req.body;
      const usuario = req.usuario;

      const treino = treinosSenhaAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de senha não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res
          .status(403)
          .json({ message: "Este treino não pertence a você" });
      }

      treino.inicio = Date.now();

      try {
        if (!usuario.isVisitante) {
          await recordeSenhaService.incrementarQuantidadeTreinoSenha(
            usuario.id,
            treino.digitos,
            treino.tamanho,
            treino.repeticao
          );
        }
      } catch (error) {
        console.error(
          "Erro ao incrementar quantidade de treino de senha:",
          error
        );
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Erro ao confirmar início do treino de senha:", error);
      return res.status(500).json({
        message: "Erro ao confirmar início do treino de senha",
        error: error.message,
      });
    }
  }

  /**
   * Receber tentativa do jogador.
   *
   * Corpo esperado: treino_id, tentativa (array de números)
   */
  async tentativa(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id, tentativa } = req.body;
      const usuario = req.usuario;

      const treino = treinosSenhaAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de senha não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res
          .status(403)
          .json({ message: "Este treino não pertence a você" });
      }

      if (treino.inicio == null) {
        return res.status(400).json({
          message:
            "Treino ainda não foi iniciado (aguardando fim da contagem)",
        });
      }

      if (treino.acertou) {
        return res
          .status(400)
          .json({ message: "Este treino já foi concluído com acerto" });
      }

      if (treino.tentativas.length >= LIMITE_TENTATIVAS) {
        return res.status(400).json({
          message: "Limite de tentativas atingido",
        });
      }

      if (!Array.isArray(tentativa) || tentativa.length !== treino.tamanho) {
        return res.status(400).json({
          message: `A tentativa deve ser um array com ${treino.tamanho} algarismos`,
        });
      }

      const tentativaNum = tentativa.map((d) => parseInt(d));

      const resultado = treinoSenhaService.verificarTentativa(
        treino.senhaSecreta,
        tentativaNum
      );

      const acertou = resultado.corretos === treino.tamanho;

      treino.tentativas.push({
        tentativa: tentativaNum,
        corretos: resultado.corretos,
        parciais: resultado.parciais,
      });

      if (acertou) {
        treino.acertou = true;
        treino.tempoFinal = Date.now() - treino.inicio;
      }

      return res.json({
        corretos: resultado.corretos,
        parciais: resultado.parciais,
        acertou,
        tentativasUsadas: treino.tentativas.length,
        tentativasRestantes: LIMITE_TENTATIVAS - treino.tentativas.length,
      });
    } catch (error) {
      console.error("Erro ao processar tentativa de senha:", error);
      return res.status(500).json({
        message: "Erro ao processar tentativa de senha",
        error: error.message,
      });
    }
  }

  /**
   * Finalizar treino de senha e salvar recorde.
   *
   * Corpo esperado: treino_id
   */
  async finalizarTreino(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id } = req.body;
      const usuario = req.usuario;

      const treino = treinosSenhaAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de senha não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res
          .status(403)
          .json({ message: "Este treino não pertence a você" });
      }

      if (treino.inicio == null) {
        return res
          .status(400)
          .json({ message: "Treino de senha ainda não foi iniciado" });
      }

      let bateuRecorde = false;
      let recordeAnterior = null;
      let recordeAtual = null;
      let erroRecorde = null;

      if (treino.acertou && !usuario.isVisitante) {
        try {
          const resultado =
            await recordeSenhaService.verificarESalvarRecordeSenha(
              usuario.id,
              treino.digitos,
              treino.tamanho,
              treino.repeticao,
              treino.tentativas.length,
              treino.tempoFinal
            );

          bateuRecorde = resultado.bateuRecorde;
          recordeAnterior = resultado.recordeAnterior;
          recordeAtual = resultado.recordeAtual;
        } catch (error) {
          console.error(
            "Erro ao verificar e salvar recorde de senha:",
            error
          );
          erroRecorde = error.message;
        }
      }

      if (!usuario.isVisitante) {
        try {
          const dataBrasil = new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Sao_Paulo",
          });
          await Usuario.sequelize.query(
            "UPDATE usuarios SET data_ultimo_treino = :data WHERE id = :id",
            { replacements: { data: dataBrasil, id: usuario.id } }
          );
        } catch (error) {
          console.error(
            "Erro ao atualizar data_ultimo_treino (senha):",
            error
          );
        }
      }

      const senhaSecreta = treino.senhaSecreta;
      const tentativas = treino.tentativas;
      const acertou = treino.acertou;
      const tempoFinal = treino.tempoFinal;

      treinosSenhaAtivos.delete(treino_id);

      return res.json({
        acertou,
        senhaSecreta,
        tentativas,
        totalTentativas: tentativas.length,
        tempo: tempoFinal,
        bateuRecorde,
        recordeAnterior,
        recordeAtual,
        erroRecorde: erroRecorde || undefined,
      });
    } catch (error) {
      console.error("Erro ao finalizar treino de senha:", error);
      return res.status(500).json({
        message: "Erro ao finalizar treino de senha",
        error: error.message,
      });
    }
  }
}

module.exports = new SenhaController();
