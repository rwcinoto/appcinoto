import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  formatarNumero,
  obterSimboloOperacao,
} from "../utils/conversaoNumerica";
import {
  CHAVE_JANEIRO_PADRAO,
  CHAVE_SECULO_21_PADRAO,
} from "../constants/calendario";
import {
  calcularDiaSemana,
  diaSemanaParaResposta,
  formatarDataNumeros,
  formatarDataTexto,
} from "../utils/formatarDataCalendario";
import "./GabaritoTreino.css";

/**
 * Formata parcela com parênteses se negativa (para exibição no gabarito).
 */
function formatarParcelaComParenteses(valorNumerico, valorFormatado) {
  if (valorNumerico === null || valorNumerico === undefined)
    return valorFormatado;
  if (valorNumerico < 0) return `(${valorFormatado})`;
  return valorFormatado;
}

/**
 * Formata parcela para divisão/multiplicação (decimal: inteiros sem vírgula quando aplicável).
 */
function formatarParcelaDivisao(valor, sistema, tipo) {
  if (tipo === "divisao" && sistema === "decimal" && Number.isInteger(valor)) {
    return valor.toString();
  }
  return formatarNumero(valor, sistema);
}

function formatarParcelaMultiplicacao(
  valor,
  sistema,
  tipo,
  numeroParcela,
  temParcela3,
) {
  if (tipo === "multiplicacao" && sistema === "decimal") {
    if (temParcela3) {
      if (numeroParcela === 1 || numeroParcela === 2) return valor.toString();
      if (numeroParcela === 3) return formatarNumero(valor, "decimal");
    } else {
      if (numeroParcela === 1) return valor.toString();
      if (numeroParcela === 2) return formatarNumero(valor, "decimal");
    }
  }
  return formatarParcelaDivisao(valor, sistema, tipo);
}

/**
 * Monta o texto da pergunta para uma conta (operação).
 */
function formatarPerguntaOperacao(
  conta,
  sistemaTipo,
  formatoResposta,
  operacaoTipo,
) {
  const sistema = sistemaTipo || "natural";

  let parcela1Formatada;
  if (operacaoTipo === "conversao") {
    if (formatoResposta === "natural") {
      parcela1Formatada = formatarNumero(conta.parcela1, sistema);
    } else {
      parcela1Formatada = formatarNumero(conta.parcela1, "natural");
    }
  } else if (conta.tipo === "multiplicacao" && sistema === "decimal") {
    parcela1Formatada = conta.parcela1.toString();
  } else {
    parcela1Formatada = formatarNumero(conta.parcela1, sistema);
  }

  if (conta.tipo === "raiz") {
    return `√${parcela1Formatada} = ?`;
  }
  if (conta.tipo === "conversao") {
    return `${parcela1Formatada} = ?`;
  }

  const temParcela3 = conta.parcela3 !== null && conta.parcela3 !== undefined;
  const parcela2Formatada =
    conta.parcela2 !== null && conta.parcela2 !== undefined
      ? formatarParcelaComParenteses(
          conta.parcela2,
          formatarParcelaMultiplicacao(
            conta.parcela2,
            sistema,
            conta.tipo,
            2,
            temParcela3,
          ),
        )
      : "";
  const parcela3Formatada = temParcela3
    ? formatarParcelaComParenteses(
        conta.parcela3,
        formatarParcelaMultiplicacao(
          conta.parcela3,
          sistema,
          conta.tipo,
          3,
          true,
        ),
      )
    : null;
  const simbolo = obterSimboloOperacao(conta.tipo);

  let expr = `${parcela1Formatada} ${simbolo} ${parcela2Formatada}`;
  if (parcela3Formatada !== null) expr += ` ${simbolo} ${parcela3Formatada}`;
  return `${expr} = ?`;
}

/**
 * Monta a resposta correta para uma conta (operação).
 * Resposta no formato que o usuário escolheu: natural ou no sistema.
 */
function formatarRespostaOperacao(
  conta,
  sistemaTipo,
  formatoResposta,
  operacaoTipo,
) {
  const sistema = sistemaTipo || "natural";
  const valor = conta.resultado;

  if (operacaoTipo === "conversao") {
    if (formatoResposta === "natural") {
      return formatarNumero(conta.parcela1, "natural");
    }
    return formatarNumero(conta.parcela1, sistema);
  }

  if (formatoResposta === "natural") {
    return formatarNumero(valor, "natural");
  }
  return formatarNumero(valor, sistema);
}

/**
 * Título do treino para o cabeçalho da página.
 */
function tituloTreino(state) {
  if (!state) return "Gabarito do treino";
  if (state.modoCalendario && state.treinoData) {
    const tipo =
      state.tipoTreinoCalendario || state.treinoData.tipo || "calendário";
    const limite = state.treinoData.limite?.descricao || "";
    return `Treino de calendário${tipo ? ` (${tipo})` : ""}${limite ? ` – ${limite}` : ""}`;
  }
  if (state.treinoData?.operacao) {
    const op = state.treinoData.operacao.nome || "Operação";
    const limite = state.treinoData.limite?.descricao || "";
    const sistema = state.treinoData.sistema?.tipo || state.sistemaTipo || "";
    return `Treino de operações – ${op}${limite ? ` – ${limite}` : ""}${sistema ? ` (${sistema})` : ""}`;
  }
  return "Gabarito do treino";
}

/**
 * Retorna a rota de "Voltar" conforme o tipo de treino (mesmo destino do botão Finalizar).
 */
function getRotaVoltar(state) {
  if (!state?.treinoData) return "/novo-treino";
  const td = state.treinoData;
  if (state.modoCalendario) {
    const params = new URLSearchParams();
    if (td.tipo) params.set("tipo", td.tipo);
    if (td.limite?.id != null) params.set("limite_id", String(td.limite.id));
    return params.toString()
      ? `/calendario?${params.toString()}`
      : "/calendario";
  }
  const params = new URLSearchParams();
  if (td.operacao?.id != null)
    params.set("operacao_id", String(td.operacao.id));
  if (td.limite?.id != null) params.set("limite_id", String(td.limite.id));
  if (td.sistema?.id != null) params.set("sistema_id", String(td.sistema.id));
  return params.toString() ? `/rankings?${params.toString()}` : "/novo-treino";
}

// Helpers de calendário para os treinos especiais (ano, dia, mês, século)
function normalizarChaveModulo7(valor) {
  if (typeof valor !== "number" || !Number.isFinite(valor)) {
    return 0;
  }
  const mod = ((valor % 7) + 7) % 7; // 0..6
  if (mod === 0) return 0;
  return mod <= 3 ? mod : mod - 7; // 4 -> -3, 5 -> -2, 6 -> -1
}

function calcularChaveAnoFrontend(anoCompleto) {
  if (typeof anoCompleto !== "number" || !Number.isFinite(anoCompleto)) {
    return 0;
  }
  const doisUltimos = Math.abs(anoCompleto) % 100;
  return (doisUltimos + Math.floor(doisUltimos / 4)) % 7;
}

function calcularChaveMesFrontend(mes, chaveJaneiroBase = CHAVE_JANEIRO_PADRAO) {
  let delta = 0;
  switch (mes) {
    case 1: // janeiro
    case 10: // outubro
      delta = 0;
      break;
    case 4: // abril
    case 7: // julho
      delta = -1;
      break;
    case 5: // maio
      delta = 1;
      break;
    case 8: // agosto
      delta = 2;
      break;
    case 2: // fevereiro
    case 3: // março
    case 11: // novembro
      delta = 3;
      break;
    case 9: // setembro
    case 12: // dezembro
      delta = -2;
      break;
    case 6: // junho
      delta = -3;
      break;
    default:
      delta = 0;
  }
  const base = chaveJaneiroBase ?? CHAVE_JANEIRO_PADRAO;
  const valorBruto = base + delta;
  return normalizarChaveModulo7(valorBruto);
}

function calcularChaveSeculoFrontend(ano, chaveSeculo21Base = CHAVE_SECULO_21_PADRAO) {
  if (typeof ano !== "number" || !Number.isFinite(ano)) {
    return 0;
  }
  const seculo = Math.floor(ano / 100) + 1;
  let delta;
  switch (seculo) {
    case 17:
    case 21:
      delta = 0;
      break;
    case 16:
    case 20:
    case 24:
      delta = 1;
      break;
    case 19:
    case 23:
      delta = 3;
      break;
    case 18:
    case 22:
      delta = -2;
      break;
    default:
      // Para outros séculos, manter base como aproximação
      delta = 0;
  }
  const base = chaveSeculo21Base ?? CHAVE_SECULO_21_PADRAO;
  const valorBruto = base + delta;
  return normalizarChaveModulo7(valorBruto);
}

const GabaritoTreino = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  const itens = state?.itens ?? [];
  const formatoResposta = state?.formatoResposta ?? "sistema";
  const sistemaTipo = state?.sistemaTipo ?? "natural";
  const treinoData = state?.treinoData;
  const operacaoTipo = treinoData?.operacao?.tipo ?? null;
  const visualizacaoCalendario = state?.visualizacaoCalendario ?? "numeros";
  const tipoTreinoCalendario =
    state?.tipoTreinoCalendario || state?.treinoData?.tipo || "data_geral";
  const chaveSeculo21Base = state?.chaveSeculo21Base;
  const chaveJaneiroBase = state?.chaveJaneiroBase;
  const rotaVoltar = getRotaVoltar(state);

  if (!state || !Array.isArray(itens) || itens.length === 0) {
    return (
      <div className="gabarito-treino-page">
        <div className="gabarito-treino-empty">
          <h1>Gabarito do treino</h1>
          <p>Nenhum dado de gabarito disponível.</p>
          <button
            type="button"
            className="btn-voltar-gabarito"
            onClick={() => navigate(rotaVoltar)}
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const titulo = tituloTreino(state);

  return (
    <div className="gabarito-treino-page">
      <div className="gabarito-treino-container">
        <h1 className="gabarito-treino-titulo">{titulo}</h1>
        <p className="gabarito-treino-subtitulo">
          Perguntas apresentadas no treino e respostas corretas
        </p>

        <div className="gabarito-treino-tabela-wrapper">
          <table className="gabarito-treino-tabela">
            <thead>
              <tr>
                <th className="col-num">#</th>
                <th className="col-pergunta">Pergunta</th>
                <th className="col-resposta">Resposta</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => {
                if (item.tipo === "calendario" && item.data) {
                  const { ano, mes, dia } = item.data;
                  const pergunta =
                    visualizacaoCalendario === "texto"
                      ? formatarDataTexto(item.data)
                      : formatarDataNumeros(item.data);

                  let resposta;
                  if (tipoTreinoCalendario === "dia") {
                    // Treino de dias: dia da data módulo 7 (0..6)
                    resposta = ((dia % 7) + 7) % 7;
                  } else if (tipoTreinoCalendario === "ano") {
                    // Treino de anos: chave do ano (dois últimos dígitos)
                    resposta = calcularChaveAnoFrontend(ano);
                  } else if (tipoTreinoCalendario === "mes") {
                    // Treino de meses: chave do mês (exibir em 0..6, sem negativos)
                    const baseNorm = normalizarChaveModulo7(
                      Number(chaveJaneiroBase ?? CHAVE_JANEIRO_PADRAO),
                    );
                    const chaveMes = calcularChaveMesFrontend(mes, baseNorm);
                    resposta = ((chaveMes % 7) + 7) % 7;
                  } else if (tipoTreinoCalendario === "seculo") {
                    // Treino de séculos: chave do século a partir da chave do século XXI
                    const baseNorm = normalizarChaveModulo7(
                      Number(chaveSeculo21Base ?? CHAVE_SECULO_21_PADRAO),
                    );
                    resposta = calcularChaveSeculoFrontend(ano, baseNorm);
                  } else {
                    // Demais treinos de calendário: dia da semana (1..7)
                    const diaSemana = calcularDiaSemana(ano, mes, dia);
                    resposta = diaSemanaParaResposta(diaSemana);
                  }

                  return (
                    <tr key={`cal-${index}-${ano}-${mes}-${dia}`}>
                      <td className="col-num">{index + 1}</td>
                      <td className="col-pergunta">{pergunta}</td>
                      <td className="col-resposta">{resposta}</td>
                    </tr>
                  );
                }
                if (item.tipo === "operacao" && item.conta) {
                  const conta = item.conta;
                  const pergunta = formatarPerguntaOperacao(
                    conta,
                    sistemaTipo,
                    formatoResposta,
                    operacaoTipo,
                  );
                  const resposta = formatarRespostaOperacao(
                    conta,
                    sistemaTipo,
                    formatoResposta,
                    operacaoTipo,
                  );
                  return (
                    <tr
                      key={`op-${index}-${conta.parcela1}-${conta.parcela2}-${conta.resultado}`}
                    >
                      <td className="col-num">{index + 1}</td>
                      <td className="col-pergunta">{pergunta}</td>
                      <td className="col-resposta">{resposta}</td>
                    </tr>
                  );
                }
                return null;
              })}
            </tbody>
          </table>
        </div>

        <div className="gabarito-treino-actions">
          <button
            type="button"
            className="btn-voltar-gabarito"
            onClick={() => navigate(rotaVoltar)}
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GabaritoTreino;
