"use strict";

/**
 * Serviço utilitário para operações de calendário:
 * - cálculo de dia da semana
 * - sorteio de datas em intervalos específicos
 * - formatação de datas em texto e em números
 */

// Constantes de tipos de treino de calendário
const TIPOS_TREINO_CALENDARIO = {
  DATA_GERAL: "data_geral",
  DIA: "dia",
  MES: "mes",
  ANO: "ano",
  SECULO: "seculo",
  DATA_ESSE_ANO: "data_esse_ano",
  DATA_21: "data_21",
};

// Intervalo padrão do sistema (inclusive)
const INTERVALO_PADRAO = {
  inicio: { ano: 1582, mes: 10, dia: 15 }, // 15/10/1582
  fim: { ano: 2399, mes: 12, dia: 31 }, // 31/12/2399
};

// Intervalo século XXI (inclusive)
const INTERVALO_SECULO_21 = {
  inicio: { ano: 2000, mes: 1, dia: 1 }, // 01/01/2000
  fim: { ano: 2099, mes: 12, dia: 31 }, // 31/12/2099
};

// Nomes dos meses em português (1-based)
const NOMES_MESES = [
  null,
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

/**
 * Calcula o dia da semana de uma data no calendário gregoriano.
 *
 * Algoritmo: Tomohiko Sakamoto (0 = domingo, 1 = segunda, ..., 6 = sábado).
 *
 * @param {number} ano - Ano (1582–2399 dentro do escopo do sistema)
 * @param {number} mes - Mês (1–12)
 * @param {number} dia - Dia (1–31, conforme o mês)
 * @returns {number} Dia da semana (0 = domingo, 1 = segunda, ..., 6 = sábado)
 */
function calcularDiaSemana(ano, mes, dia) {
  if (
    typeof ano !== "number" ||
    typeof mes !== "number" ||
    typeof dia !== "number"
  ) {
    throw new Error("Ano, mês e dia devem ser números.");
  }

  // Validação mínima de intervalo conforme especificação do sistema
  if (ano < INTERVALO_PADRAO.inicio.ano || ano > INTERVALO_PADRAO.fim.ano) {
    throw new Error("Ano fora do intervalo suportado (1582–2399).");
  }

  // Algoritmo de Sakamoto para calendário gregoriano
  const t = [0, 3, 2, 5, 0, 3, 5, 1, 4, 6, 2, 4];
  let y = ano;
  let m = mes;

  if (m < 3) {
    y -= 1;
  }

  const w =
    (y +
      Math.floor(y / 4) -
      Math.floor(y / 100) +
      Math.floor(y / 400) +
      t[m - 1] +
      dia) %
    7;

  // Garantir valor positivo (JavaScript pode dar negativo com %)
  return (w + 7) % 7; // 0 = domingo, ..., 6 = sábado
}

/**
 * Converte o dia da semana interno (0–6, 0 = domingo) para o formato:
 * 1 = domingo, 2 = segunda, ..., 6 = sexta, 7 = sábado.
 *
 * @param {number} diaSemana - 0 (domingo) a 6 (sábado)
 * @returns {number} 1–7 conforme especificação (0/7 representam sábado como equivalentes)
 */
function converterDiaSemanaParaFormatoUsuario(diaSemana) {
  const d = ((diaSemana % 7) + 7) % 7;
  // 0=domingo -> 1, 1->2, ..., 5->6, 6 (sábado) -> 7
  return d === 0 ? 1 : d === 6 ? 7 : d + 1;
}

/**
 * Converte um trio ano/mes/dia em timestamp UTC (início do dia).
 * Usar sempre UTC para evitar problemas de fuso horário.
 *
 * @param {number} ano
 * @param {number} mes - 1–12
 * @param {number} dia
 * @returns {number} timestamp em milissegundos
 */
function toUtcTimestamp(ano, mes, dia) {
  return Date.UTC(ano, mes - 1, dia);
}

/**
 * Converte timestamp UTC (início do dia) em objeto { ano, mes, dia }.
 *
 * @param {number} timestamp
 * @returns {{ ano: number, mes: number, dia: number }}
 */
function fromUtcTimestamp(timestamp) {
  const d = new Date(timestamp);
  return {
    ano: d.getUTCFullYear(),
    mes: d.getUTCMonth() + 1,
    dia: d.getUTCDate(),
  };
}

/**
 * Sorteia uma data inteira em um intervalo [inicio, fim] (ambos inclusivos).
 *
 * @param {{ ano: number, mes: number, dia: number }} inicio
 * @param {{ ano: number, mes: number, dia: number }} fim
 * @returns {{ ano: number, mes: number, dia: number }}
 */
function sortearDataNoIntervalo(inicio, fim) {
  const inicioTs = toUtcTimestamp(inicio.ano, inicio.mes, inicio.dia);
  const fimTs = toUtcTimestamp(fim.ano, fim.mes, fim.dia);

  if (fimTs < inicioTs) {
    throw new Error("Intervalo de datas inválido.");
  }

  const msPorDia = 24 * 60 * 60 * 1000;
  const totalDias = Math.floor((fimTs - inicioTs) / msPorDia);
  const deslocamentoDias = Math.floor(Math.random() * (totalDias + 1));
  const ts = inicioTs + deslocamentoDias * msPorDia;

  return fromUtcTimestamp(ts);
}

/**
 * Sorteia uma data no intervalo padrão 15/10/1582 a 31/12/2399.
 *
 * @returns {{ ano: number, mes: number, dia: number }}
 */
function sortearDataGeral() {
  return sortearDataNoIntervalo(INTERVALO_PADRAO.inicio, INTERVALO_PADRAO.fim);
}

/**
 * Sorteia uma data apenas no século XXI (2000–2099).
 *
 * @returns {{ ano: number, mes: number, dia: number }}
 */
function sortearDataSeculo21() {
  return sortearDataNoIntervalo(
    INTERVALO_SECULO_21.inicio,
    INTERVALO_SECULO_21.fim,
  );
}

/**
 * Retorna o ano atual no fuso horário do Brasil (America/Sao_Paulo).
 *
 * @returns {number}
 */
function getAnoAtualBrasil() {
  const str = new Date().toLocaleDateString("en-CA", {
    timeZone: "America/Sao_Paulo",
  });
  return parseInt(str.slice(0, 4), 10);
}

/**
 * Sorteia uma data apenas no ano atual (Brasil).
 * Intervalo: 01/01/anoAtual a 31/12/anoAtual.
 *
 * @returns {{ ano: number, mes: number, dia: number }}
 */
function sortearDataAnoAtual() {
  const ano = getAnoAtualBrasil();
  const inicio = { ano, mes: 1, dia: 1 };
  const fim = { ano, mes: 12, dia: 31 };
  return sortearDataNoIntervalo(inicio, fim);
}

/**
 * Formata uma data em texto, por exemplo: "15 de setembro de 1984".
 *
 * @param {{ ano: number, mes: number, dia: number }} data
 * @returns {string}
 */
function formatarDataTexto({ ano, mes, dia }) {
  if (!ano || !mes || !dia) {
    throw new Error("Data inválida para formatação em texto.");
  }

  const nomeMes = NOMES_MESES[mes];
  if (!nomeMes) {
    throw new Error("Mês inválido para formatação em texto.");
  }

  return `${dia} de ${nomeMes} de ${ano}`;
}

/**
 * Formata uma data em números, por exemplo: "15/09/1984".
 *
 * @param {{ ano: number, mes: number, dia: number }} data
 * @returns {string}
 */
function formatarDataNumeros({ ano, mes, dia }) {
  if (!ano || !mes || !dia) {
    throw new Error("Data inválida para formatação numérica.");
  }

  const diaStr = String(dia).padStart(2, "0");
  const mesStr = String(mes).padStart(2, "0");

  return `${diaStr}/${mesStr}/${ano}`;
}

module.exports = {
  TIPOS_TREINO_CALENDARIO,
  INTERVALO_PADRAO,
  INTERVALO_SECULO_21,
  calcularDiaSemana,
  converterDiaSemanaParaFormatoUsuario,
  sortearDataNoIntervalo,
  sortearDataGeral,
  sortearDataSeculo21,
  sortearDataAnoAtual,
  getAnoAtualBrasil,
  formatarDataTexto,
  formatarDataNumeros,
};
