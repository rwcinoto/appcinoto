/**
 * Utilitário para formatação de datas em treinos de calendário.
 * Alinhado com o backend (calendarioService).
 */

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
 * Formata uma data em texto, ex.: "12 de abril de 1976"
 * @param {{ ano: number, mes: number, dia: number }} data
 * @returns {string}
 */
export function formatarDataTexto({ ano, mes, dia }) {
  if (!ano || !mes || !dia) return "";
  const nomeMes = NOMES_MESES[mes];
  if (!nomeMes) return "";
  return `${dia} de ${nomeMes} de ${ano}`;
}

/**
 * Formata uma data em números, ex.: "12/04/1976"
 * @param {{ ano: number, mes: number, dia: number }} data
 * @returns {string}
 */
export function formatarDataNumeros({ ano, mes, dia }) {
  if (!ano || !mes || !dia) return "";
  const diaStr = String(dia).padStart(2, "0");
  const mesStr = String(mes).padStart(2, "0");
  return `${diaStr}/${mesStr}/${ano}`;
}

/**
 * Calcula o dia da semana para uma data (calendário gregoriano, UTC).
 * Compatível com o backend: 0 = domingo, 1 = segunda, ..., 6 = sábado.
 * @param {number} ano
 * @param {number} mes - 1 a 12
 * @param {number} dia
 * @returns {number} 0 (domingo) a 6 (sábado)
 */
export function calcularDiaSemana(ano, mes, dia) {
  const d = new Date(Date.UTC(ano, mes - 1, dia));
  return d.getUTCDay();
}

/**
 * Converte dia da semana interno (0–6) para formato do usuário: 1 = domingo, ..., 7 = sábado.
 * @param {number} diaSemana - 0 (domingo) a 6 (sábado)
 * @returns {number} 1 a 7
 */
export function diaSemanaParaResposta(diaSemana) {
  const d = ((diaSemana % 7) + 7) % 7;
  return d === 0 ? 1 : d === 6 ? 7 : d + 1;
}
