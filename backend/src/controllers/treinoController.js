"use strict";

const { validationResult } = require("express-validator");
const { Operacao, Limite, Sistema } = require("../models");
const treinoService = require("../services/treinoService");
const recordeService = require("../services/recordeService");

// Armazenar treinos ativos em memória (Map: treino_id -> dados do treino)
// Em produção, isso poderia ser movido para Redis ou banco de dados
const treinosAtivos = new Map();
let proximoIdTreino = 1;

/**
 * Gerar ID único para treino
 */
function gerarIdTreino() {
  return `treino_${proximoIdTreino++}_${Date.now()}`;
}

/**
 * Limpar treinos antigos (mais de 1 hora)
 */
function limparTreinosAntigos() {
  const agora = Date.now();
  const umaHoraAtras = agora - 60 * 60 * 1000;

  for (const [id, treino] of treinosAtivos.entries()) {
    if (treino.inicio < umaHoraAtras) {
      treinosAtivos.delete(id);
    }
  }
}

class TreinoController {
  /**
   * Iniciar treino
   */
  async iniciar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { operacao_id, limite_id, sistema_id } = req.body;
      const usuario = req.usuario;

      // Validar que operação existe e usuário tem acesso
      const operacao = await Operacao.findByPk(operacao_id, {
        include: [
          { association: "plano" },
          { association: "operacoes_incluidas" },
        ],
      });

      if (!operacao) {
        return res.status(404).json({ message: "Operação não encontrada" });
      }

      // Verificar se a operação está disponível para o plano do usuário (baseado na hierarquia)
      const ordemPlanoUsuario = usuario.plano?.ordem;
      const ordemPlanoOperacao = operacao.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoOperacao ||
        ordemPlanoOperacao > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message: "Esta operação não está disponível no seu plano",
        });
      }

      // Validar que limite existe e usuário tem acesso
      const limite = await Limite.findByPk(limite_id, {
        include: [{ association: "plano" }],
      });

      if (!limite) {
        return res.status(404).json({ message: "Limite não encontrado" });
      }

      // Verificar se o limite está disponível para o plano do usuário (baseado na hierarquia)
      const ordemPlanoLimite = limite.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoLimite ||
        ordemPlanoLimite > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message: "Este limite não está disponível no seu plano",
        });
      }

      // Validar que sistema existe e usuário tem acesso
      const sistema = await Sistema.findByPk(sistema_id, {
        include: [{ association: "plano" }],
      });

      if (!sistema) {
        return res.status(404).json({ message: "Sistema não encontrado" });
      }

      // Verificar se o sistema está disponível para o plano do usuário (baseado na hierarquia)
      const ordemPlanoSistema = sistema.plano?.ordem;

      if (
        !ordemPlanoUsuario ||
        !ordemPlanoSistema ||
        ordemPlanoSistema > ordemPlanoUsuario
      ) {
        return res.status(403).json({
          message: "Este sistema não está disponível no seu plano",
        });
      }

      // Validar que sistema "inteiro" não pode ser usado com operação "raiz"
      if (operacao.tipo === "raiz" && sistema.tipo === "inteiro") {
        return res.status(400).json({
          message: "Sistema 'inteiro' não pode ser usado com operação 'raiz quadrada'",
        });
      }

      // Validar que operação de conversão só pode usar sistemas romano, binário ou hexadecimal
      if (operacao.tipo === "conversao") {
        const sistemasValidosConversao = ["romano", "binario", "hexadecimal"];
        if (!sistemasValidosConversao.includes(sistema.tipo)) {
          return res.status(400).json({
            message: "Operação 'Conversão' só pode ser usada com sistemas romano, binário ou hexadecimal",
          });
        }
      }

      // Validar que operação aleatória tem operações incluídas
      if (operacao.tipo === "aleatorio") {
        if (!operacao.operacoes_incluidas || operacao.operacoes_incluidas.length === 0) {
          return res.status(400).json({
            message: "Operação aleatória não possui operações configuradas",
          });
        }
      }

      // Gerar todas as contas antes do treino começar
      // 150 contas por minuto de treino, garantindo que não haja repetições seguidas
      // O campo tempo está em segundos, então: (tempo_em_segundos / 60) * 150
      const quantidadeContas = Math.ceil((limite.tempo / 60) * 150);
      const contasIniciais = treinoService.gerarContasSemRepeticoes(
        operacao,
        quantidadeContas,
        sistema.tipo
      );

      // Criar treino
      const treinoId = gerarIdTreino();
      const treino = {
        id: treinoId,
        id_usuario: usuario.id,
        operacao: {
          id: operacao.id,
          nome: operacao.nome,
          descricao: operacao.descricao,
          tipo: operacao.tipo,
          min_parcela_1: operacao.min_parcela_1,
          max_parcela_1: operacao.max_parcela_1,
          min_parcela_2: operacao.min_parcela_2,
          max_parcela_2: operacao.max_parcela_2,
          min_parcela_3: operacao.min_parcela_3,
          max_parcela_3: operacao.max_parcela_3,
          // Incluir operações relacionadas se for tipo aleatorio
          ...(operacao.tipo === "aleatorio" && operacao.operacoes_incluidas
            ? {
                operacoes_incluidas: operacao.operacoes_incluidas.map((op) => ({
                  id: op.id,
                  nome: op.nome,
                  tipo: op.tipo,
                  min_parcela_1: op.min_parcela_1,
                  max_parcela_1: op.max_parcela_1,
                  min_parcela_2: op.min_parcela_2,
                  max_parcela_2: op.max_parcela_2,
                  min_parcela_3: op.min_parcela_3,
                  max_parcela_3: op.max_parcela_3,
                })),
              }
            : {}),
        },
        limite: {
          id: limite.id,
          descricao: limite.descricao,
          tempo: limite.tempo,
        },
        sistema: {
          id: sistema.id,
          descricao: sistema.descricao,
          tipo: sistema.tipo,
        },
        contas: contasIniciais,
        inicio: Date.now(),
        totalAcertos: 0,
        totalRespondido: 0,
        tempoLimite: limite.tempo * 1000, // Converter para milissegundos
      };

      treinosAtivos.set(treinoId, treino);

      // Limpar treinos antigos periodicamente
      limparTreinosAntigos();

      return res.json({
        treino_id: treinoId,
        operacao: {
          id: operacao.id,
          nome: operacao.nome,
          tipo: operacao.tipo,
        },
        limite: {
          id: limite.id,
          descricao: limite.descricao,
          tempo: limite.tempo,
        },
        sistema: {
          id: sistema.id,
          tipo: sistema.tipo,
        },
        contas_iniciais: contasIniciais.slice(0, 2), // Retornar apenas as primeiras 2 (atual e próxima)
      });
    } catch (error) {
      console.error("Erro ao iniciar treino:", error);
      return res.status(500).json({
        message: "Erro ao iniciar treino",
        error: error.message,
      });
    }
  }

  /**
   * Validar resposta do usuário
   */
  async validarResposta(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id, resposta } = req.body;
      const usuario = req.usuario;

      // Buscar treino
      const treino = treinosAtivos.get(treino_id);

      if (!treino) {
        return res.status(404).json({ message: "Treino não encontrado" });
      }

      // Validar que o treino pertence ao usuário
      if (treino.id_usuario !== usuario.id) {
        return res.status(403).json({
          message: "Este treino não pertence a você",
        });
      }

      // Verificar se o tempo do treino já esgotou
      const tempoDecorrido = Date.now() - treino.inicio;
      if (tempoDecorrido > treino.tempoLimite) {
        // Tempo esgotado - retornar erro mas não bloquear (pode ser uma resposta pendente)
        // Não contar a resposta no totalAcertos
        return res.json({
          correto: false,
          respostaEsperada: null,
          proximaConta: null,
          tempoEsgotado: true,
        });
      }

      // Verificar se ainda há contas
      if (treino.contas.length === 0) {
        // Se não houver mais contas, retornar erro
        // Isso não deveria acontecer, pois geramos 150 contas por minuto
        console.error("Erro: Buffer de contas vazio!");
        return res.status(500).json({
          message: "Não há mais contas disponíveis para o treino",
        });
      }

      // Pegar primeira conta (a conta atual que o usuário está respondendo)
      const contaAtual = treino.contas[0];
      
      // Pegar a próxima conta que será adicionada no final do array do frontend
      // O frontend remove a primeira e adiciona esta no final
      // Precisamos retornar a conta que está na posição 2 (antes do shift)
      // porque a conta na posição 1 já está no frontend e virá a primeira após o shift
      // Se não houver conta na posição 2, retornar null (frontend já tem a próxima)
      const proximaConta = treino.contas.length > 2 ? treino.contas[2] : null;

      // Obter formato de resposta (pode ser "sistema" ou "natural")
      // Se não fornecido, usar "sistema" como padrão
      const formatoResposta = req.body.formato_resposta || "sistema";
      
      // Determinar sistema de validação baseado no formato escolhido e tipo de operação
      let sistemaValidacao;
      
      // Se for operação de conversão, inverter a direção da conversão baseado no formato_resposta
      if (treino.operacao.tipo === "conversao") {
        // Para conversão:
        // - Se formato_resposta = "natural": mostrar número no sistema, usuário responde em natural
        //   -> Validar como natural (resultado esperado = parcela1 em natural)
        // - Se formato_resposta = "sistema": mostrar número em natural, usuário responde no sistema
        //   -> Validar no sistema escolhido (resultado esperado = parcela1 convertido para o sistema)
        sistemaValidacao = formatoResposta === "natural" 
          ? "natural" 
          : treino.sistema.tipo;
      } else {
        // Para outras operações, comportamento normal
        // Se formato_resposta for "natural", validar como natural
        // Caso contrário, usar o sistema do treino
        sistemaValidacao = formatoResposta === "natural" 
          ? "natural" 
          : treino.sistema.tipo;
      }

      // Validar resposta usando treinoService
      const validacao = treinoService.validarResposta(
        contaAtual,
        resposta,
        sistemaValidacao
      );

      // Atualizar estatísticas
      treino.totalRespondido++;
      if (validacao.correto) {
        treino.totalAcertos++;
      }

      // Remover conta atual da lista (sempre remover)
      treino.contas.shift();

      return res.json({
        correto: validacao.correto,
        respostaEsperada: validacao.respostaEsperada,
        proximaConta: proximaConta,
      });
    } catch (error) {
      console.error("Erro ao validar resposta:", error);
      return res.status(500).json({
        message: "Erro ao validar resposta",
        error: error.message,
      });
    }
  }

  /**
   * Finalizar treino
   */
  async finalizar(req, res) {
    try {
      const erros = validationResult(req);
      if (!erros.isEmpty()) {
        return res.status(400).json({ errors: erros.array() });
      }

      const { treino_id, total } = req.body;
      const usuario = req.usuario;

      // Buscar treino
      const treino = treinosAtivos.get(treino_id);

      if (!treino) {
        return res.status(404).json({ message: "Treino não encontrado" });
      }

      // Validar que o treino pertence ao usuário
      if (treino.id_usuario !== usuario.id) {
        return res.status(403).json({
          message: "Este treino não pertence a você",
        });
      }

      // Não validar tempo ultrapassado - permitir finalização quando o tempo esgota
      // O timer do frontend controla quando o tempo acaba
      // Se o tempo passou muito (mais de 5 minutos além), pode ser um treino abandonado
      const tempoDecorrido = Date.now() - treino.inicio;
      const tolerancia = 300000; // 5 minutos de tolerância para treinos abandonados
      if (tempoDecorrido > treino.tempoLimite + tolerancia) {
        return res.status(400).json({
          message: "Este treino expirou há muito tempo",
        });
      }

      // Não validar total do frontend - o backend é a fonte da verdade
      // O totalAcertos do backend é o valor correto, independente do que o frontend enviou
      // Isso evita problemas de sincronia entre frontend e backend

      // Verificar e salvar recorde
      let bateuRecorde = false;
      let recordeAnterior = null;
      let erroRecorde = null;

      try {
        console.log("Tentando salvar recorde:", {
          usuarioId: usuario.id,
          operacaoId: treino.operacao.id,
          limiteId: treino.limite.id,
          sistemaId: treino.sistema.id,
          totalAcertos: treino.totalAcertos,
        });

        const resultado = await recordeService.verificarESalvarRecorde(
          usuario.id,
          treino.operacao.id,
          treino.limite.id,
          treino.sistema.id,
          treino.totalAcertos
        );

        console.log("Resultado do recorde:", resultado);

        bateuRecorde = resultado.bateuRecorde;
        recordeAnterior = resultado.recordeAnterior || null;
      } catch (error) {
        console.error("Erro ao verificar e salvar recorde:", error);
        console.error("Stack trace:", error.stack);
        erroRecorde = error.message;
        // Continuar mesmo se houver erro ao verificar recorde
        // Não bloquear a finalização do treino por erro no recorde
      }

      // Remover treino da memória
      treinosAtivos.delete(treino_id);

      return res.json({
        total: treino.totalAcertos,
        bateuRecorde,
        recordeAnterior,
        erroRecorde: erroRecorde || undefined, // Incluir erro apenas se houver (para debug)
      });
    } catch (error) {
      console.error("Erro ao finalizar treino:", error);
      return res.status(500).json({
        message: "Erro ao finalizar treino",
        error: error.message,
      });
    }
  }
}

module.exports = new TreinoController();
