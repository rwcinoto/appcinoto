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
