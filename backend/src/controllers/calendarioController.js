"use strict";

const { validationResult } = require("express-validator");
const { Limite, Usuario } = require("../models");
const treinoCalendarioService = require("../services/treinoCalendarioService");
const recordeCalendarioService = require("../services/recordeCalendarioService");

// Armazenar treinos de calendário ativos em memória (Map: treino_id -> dados do treino)
// Em produção, isso poderia ser movido para Redis ou banco de dados
const treinosCalendarioAtivos = new Map();
let proximoIdTreinoCalendario = 1;

/**
 * Gerar ID único para treino de calendário
 */
function gerarIdTreinoCalendario() {
  return `treino_calendario_${proximoIdTreinoCalendario++}_${Date.now()}`;
}

/**
 * Limpar treinos de calendário antigos (mais de 1 hora)
 */
function limparTreinosCalendarioAntigos() {
  const agora = Date.now();
  const umaHoraAtras = agora - 60 * 60 * 1000;

  for (const [id, treino] of treinosCalendarioAtivos.entries()) {
    if (treino.inicio != null && treino.inicio < umaHoraAtras) {
      treinosCalendarioAtivos.delete(id);
    }
  }
}

class CalendarioController {
  /**
   * Iniciar treino de calendário
   *
   * Corpo esperado:
   * - tipo: "data_geral" | "mes" | "dia" | "ano" | "seculo" | "data_21" | "data_esse_ano"
   * - limite_id: ID do limite de tempo
   */
  async iniciarTreino(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { tipo, limite_id, chaveSeculo21Base, chaveJaneiroBase } = req.body;
      const usuario = req.usuario;

      if (!tipo || !limite_id) {
        return res.status(400).json({
          message: "Campos obrigatórios: tipo, limite_id",
        });
      }

      // Validar limite e acesso por plano (mesmo padrão do treino de operações)
      const limite = await Limite.findByPk(limite_id, {
        include: [{ association: "plano" }],
      });

      if (!limite) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }

      const ordemPlanoUsuario = usuario.plano?.ordem;
      const ordemPlanoLimite = limite.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoLimite ||
        ordemPlanoLimite > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message: "Este limite não está disponível no seu nível",
        });
      }

      // Regras específicas de plano para tipos de treino de calendário
      // Plano id = 2: apenas data_geral
      // Plano id >= 3: pode ano, seculo (além de data_geral)
      // Plano id >= 4: pode dia e mês (além dos demais)
      // Plano id >= 5: pode data_21 e data_esse_ano (além dos demais)
      const planoId = usuario.id_plano;

      const tiposBasicos = ["data_geral"];
      const tiposAtePlano3 = ["ano", "seculo"];
      const tiposAtePlano4 = ["dia", "mes"];
      const tiposAtePlano5 = ["data_21", "data_esse_ano"];

      const tipoTreino = String(tipo);

      const permitidoPorPlano =
        // data_geral é permitido para todos
        tiposBasicos.includes(tipoTreino) ||
        // ano e século a partir do plano 3
        (planoId >= 3 && tiposAtePlano3.includes(tipoTreino)) ||
        // dia e mês a partir do plano 4
        (planoId >= 4 && tiposAtePlano4.includes(tipoTreino)) ||
        // data_21 e data_esse_ano a partir do plano 5
        (planoId >= 5 && tiposAtePlano5.includes(tipoTreino));

      if (!permitidoPorPlano) {
        return res.status(403).json({
          message:
            "Este tipo de treino de calendário não está disponível no seu nível",
        });
      }

      // Gerar todas as datas antes do treino começar
      // 150 datas por minuto de treino (mesma lógica das operações)
      const quantidadeDatas = Math.ceil((limite.tempo / 60) * 150);
      const datasIniciais = treinoCalendarioService.gerarBufferDatas(
        quantidadeDatas,
        tipoTreino,
      );

      // Criar treino de calendário (inicio será definido em confirmar-inicio, após a contagem)
      const treinoId = gerarIdTreinoCalendario();
      const treino = {
        id: treinoId,
        id_usuario: usuario.id,
        tipo: tipoTreino,
        limite: {
          id: limite.id,
          descricao: limite.descricao,
          tempo: limite.tempo,
        },
        datas: datasIniciais,
        // Para treinos de século, armazenamos a chave base do século XXI,
        // informada pelo usuário (padrão 0), normalizada em -7..7.
        chaveSeculo21Base:
          tipoTreino === "seculo"
            ? treinoCalendarioService.normalizarChaveModulo7(
                Number(chaveSeculo21Base) || 0,
              )
            : undefined,
        // Para treinos de meses, armazenamos a chave base de janeiro,
        // informada pelo usuário (padrão 0), normalizada em -7..7.
        chaveJaneiroBase:
          tipoTreino === "mes"
            ? treinoCalendarioService.normalizarChaveModulo7(
                Number(chaveJaneiroBase) || 0,
              )
            : undefined,
        inicio: null, // definido em confirmar-inicio quando a contagem terminar
        totalAcertos: 0,
        totalRespondido: 0,
        tempoLimite: limite.tempo * 1000, // ms
      };

      treinosCalendarioAtivos.set(treinoId, treino);

      // Limpar treinos antigos periodicamente
      limparTreinosCalendarioAntigos();

      return res.json({
        treino_id: treinoId,
        tipo: tipoTreino,
        limite: {
          id: limite.id,
          descricao: limite.descricao,
          tempo: limite.tempo,
        },
        // Retornar apenas as duas primeiras datas (atual e próxima),
        // mantendo o mesmo padrão usado em operações
        datas_iniciais: datasIniciais.slice(0, 2),
      });
    } catch (error) {
      console.error("Erro ao iniciar treino de calendário:", error);
      return res.status(500).json({
        message: "Erro ao iniciar treino de calendário",
        error: error.message,
      });
    }
  }

  /**
   * Validar resposta de um treino de calendário
   *
   * Corpo esperado:
   * - treino_id
   * - resposta
   * - tipo_resposta: "numeros" | "texto"
   */
  async validarResposta(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id, resposta } = req.body;
      const tipoResposta = req.body.tipo_resposta || "numeros";
      const usuario = req.usuario;

      const treino = treinosCalendarioAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de calendário não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res.status(403).json({
          message: "Este treino não pertence a você",
        });
      }

      // Verificar se o tempo do treino já esgotou (inicio é setado em confirmar-inicio)
      if (treino.inicio == null) {
        return res.status(400).json({
          message: "Treino ainda não foi iniciado (aguardando fim da contagem)",
        });
      }
      const tempoDecorrido = Date.now() - treino.inicio;
      if (tempoDecorrido > treino.tempoLimite) {
        return res.json({
          correto: false,
          diaSemanaEsperadoNumero: null,
          diaSemanaEsperadoTexto: null,
          proximaData: null,
          tempoEsgotado: true,
        });
      }

      if (!treino.datas || treino.datas.length === 0) {
        console.error("Erro: Buffer de datas vazio no treino de calendário!");
        return res.status(500).json({
          message: "Não há mais datas disponíveis para o treino de calendário",
        });
      }

      const dataAtual = treino.datas[0];
      const proximaData = treino.datas.length > 2 ? treino.datas[2] : null;

      let validacao;
      // Treinos especiais:
      // - ANOS: resposta é a chave do ano
      // - MESES: resposta é a chave do mês, baseada na chave de janeiro
      // - SÉCULOS: resposta é a chave do século, baseada na chave do século XXI
      // - DIAS: resposta é o dia mod 7
      if (treino.tipo === "ano") {
        validacao = treinoCalendarioService.validarRespostaAno(
          dataAtual,
          resposta,
        );
      } else if (treino.tipo === "mes") {
        validacao = treinoCalendarioService.validarRespostaMes(
          dataAtual,
          resposta,
          treino.chaveJaneiroBase || 0,
        );
      } else if (treino.tipo === "seculo") {
        validacao = treinoCalendarioService.validarRespostaSeculo(
          dataAtual,
          resposta,
          treino.chaveSeculo21Base || 0,
        );
      } else if (treino.tipo === "dia") {
        validacao = treinoCalendarioService.validarRespostaDia(
          dataAtual,
          resposta,
        );
      } else {
        // Demais tipos usam a validação padrão de dia da semana
        validacao = treinoCalendarioService.validarRespostaData(
          dataAtual,
          resposta,
          tipoResposta,
        );
      }

      treino.totalRespondido++;
      if (validacao.correto) {
        treino.totalAcertos++;
        // Remover data atual do buffer apenas quando acertar
        treino.datas.shift();
      }

      return res.json({
        correto: validacao.correto,
        diaSemanaEsperadoNumero: validacao.diaSemanaEsperadoNumero,
        diaSemanaEsperadoTexto: validacao.diaSemanaEsperadoTexto,
        proximaData,
        tempoEsgotado: false,
      });
    } catch (error) {
      console.error("Erro ao validar resposta de calendário:", error);
      return res.status(500).json({
        message: "Erro ao validar resposta de calendário",
        error: error.message,
      });
    }
  }

  /**
   * Finalizar treino de calendário
   *
   * Corpo esperado:
   * - treino_id
   * - erros (opcional)
   */
  async finalizarTreino(req, res) {
    try {
      const validationErrors = validationResult(req);
      if (!validationErrors.isEmpty()) {
        return res.status(400).json({ errors: validationErrors.array() });
      }

      const { treino_id, erros } = req.body;
      const usuario = req.usuario;

      const treino = treinosCalendarioAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de calendário não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res.status(403).json({
          message: "Este treino não pertence a você",
        });
      }

      if (treino.inicio == null) {
        return res.status(400).json({
          message: "Treino de calendário ainda não foi iniciado",
        });
      }
      const tempoDecorrido = Date.now() - treino.inicio;
      const tolerancia = 300000; // 5 minutos além do limite
      if (tempoDecorrido > treino.tempoLimite + tolerancia) {
        return res.status(400).json({
          message: "Este treino de calendário expirou há muito tempo",
        });
      }

      let bateuRecorde = false;
      let recordeAnterior = null;
      let erroRecorde = null;
      let errosAtuais = null;

      if (!usuario.isVisitante) {
        try {
          const resultado =
            await recordeCalendarioService.verificarESalvarRecordeCalendario(
              usuario.id,
              treino.tipo,
              treino.limite.id,
              treino.totalAcertos,
              erros !== undefined ? erros : 0,
            );

          bateuRecorde = resultado.bateuRecorde;
          recordeAnterior = resultado.recordeAnterior || null;
          errosAtuais = resultado.errosAtuais;
        } catch (error) {
          console.error(
            "Erro ao verificar e salvar recorde de calendário:",
            error,
          );
          erroRecorde = error.message;
        }
      }

      // Atualizar data_ultimo_treino do usuário (mesmo padrão do treino de operações)
      if (!usuario.isVisitante) {
        try {
          const dataBrasil = new Date().toLocaleDateString("en-CA", {
            timeZone: "America/Sao_Paulo",
          });
          await Usuario.sequelize.query(
            "UPDATE usuarios SET data_ultimo_treino = :data WHERE id = :id",
            { replacements: { data: dataBrasil, id: usuario.id } },
          );
        } catch (error) {
          console.error(
            "Erro ao atualizar data_ultimo_treino (calendário):",
            error,
          );
        }
      }

      treinosCalendarioAtivos.delete(treino_id);

      return res.json({
        total: treino.totalAcertos,
        erros:
          errosAtuais !== null
            ? errosAtuais
            : erros !== undefined
              ? erros
              : null,
        bateuRecorde,
        recordeAnterior,
        erroRecorde: erroRecorde || undefined,
      });
    } catch (error) {
      console.error("Erro ao finalizar treino de calendário:", error);
      return res.status(500).json({
        message: "Erro ao finalizar treino de calendário",
        error: error.message,
      });
    }
  }

  /**
   * Confirmar início do treino de calendário (incrementar quantidade)
   *
   * Corpo esperado:
   * - treino_id
   */
  async confirmarInicio(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id } = req.body;
      const usuario = req.usuario;

      const treino = treinosCalendarioAtivos.get(treino_id);

      if (!treino) {
        return res
          .status(404)
          .json({ message: "Treino de calendário não encontrado" });
      }

      if (treino.id_usuario !== usuario.id) {
        return res.status(403).json({
          message: "Este treino não pertence a você",
        });
      }

      // Iniciar o cronômetro quando o usuário confirma (após a contagem regressiva)
      treino.inicio = Date.now();

      if (!usuario.isVisitante) {
        try {
          await recordeCalendarioService.incrementarQuantidadeTreinoCalendario(
            usuario.id,
            treino.tipo,
            treino.limite.id,
          );
        } catch (error) {
          console.error(
            "Erro ao incrementar quantidade de treino de calendário:",
            error,
          );
        }
      }

      return res.json({ success: true });
    } catch (error) {
      console.error("Erro ao confirmar início do treino de calendário:", error);
      return res.status(500).json({
        message: "Erro ao confirmar início do treino de calendário",
        error: error.message,
      });
    }
  }
}

module.exports = new CalendarioController();
