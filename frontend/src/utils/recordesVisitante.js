/**
 * Utilitário para gerenciar recordes de visitantes no localStorage
 * Visitantes não têm dados salvos no servidor, então armazenamos localmente
 */

const STORAGE_KEY = "visitante_recordes";

/**
 * Gera chave única para um recorde baseado na combinação de operação, limite e sistema
 * @param {number} operacaoId - ID da operação
 * @param {number} limiteId - ID do limite
 * @param {number} sistemaId - ID do sistema
 * @returns {string} Chave única para o recorde
 */
function gerarChaveRecorde(operacaoId, limiteId, sistemaId) {
  return `recorde_${operacaoId}_${limiteId}_${sistemaId}`;
}

/**
 * Obtém todos os recordes do visitante do localStorage
 * @returns {Object} Objeto com chaves de recordes e seus valores
 */
function obterTodosRecordes() {
  try {
    const recordesStr = localStorage.getItem(STORAGE_KEY);
    return recordesStr ? JSON.parse(recordesStr) : {};
  } catch (error) {
    console.error("Erro ao obter recordes do visitante:", error);
    return {};
  }
}

/**
 * Salva um recorde no localStorage
 * @param {number} operacaoId - ID da operação
 * @param {number} limiteId - ID do limite
 * @param {number} sistemaId - ID do sistema
 * @param {number} total - Total de acertos
 */
function salvarRecorde(operacaoId, limiteId, sistemaId, total) {
  try {
    const recordes = obterTodosRecordes();
    const chave = gerarChaveRecorde(operacaoId, limiteId, sistemaId);
    
    recordes[chave] = {
      total,
      atualizado_em: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(recordes));
  } catch (error) {
    console.error("Erro ao salvar recorde do visitante:", error);
  }
}

/**
 * Obtém o recorde anterior para uma combinação específica
 * @param {number} operacaoId - ID da operação
 * @param {number} limiteId - ID do limite
 * @param {number} sistemaId - ID do sistema
 * @returns {Object|null} Recorde anterior ou null se não existir
 */
function obterRecordeAnterior(operacaoId, limiteId, sistemaId) {
  try {
    const recordes = obterTodosRecordes();
    const chave = gerarChaveRecorde(operacaoId, limiteId, sistemaId);
    return recordes[chave] || null;
  } catch (error) {
    console.error("Erro ao obter recorde anterior do visitante:", error);
    return null;
  }
}

/**
 * Verifica se o total bateu um novo recorde e salva se necessário
 * @param {number} operacaoId - ID da operação
 * @param {number} limiteId - ID do limite
 * @param {number} sistemaId - ID do sistema
 * @param {number} total - Total de acertos atual
 * @returns {Object} Objeto com bateuRecorde e recordeAnterior
 */
export function verificarESalvarRecordeVisitante(operacaoId, limiteId, sistemaId, total) {
  const recordeAnterior = obterRecordeAnterior(operacaoId, limiteId, sistemaId);
  
  // Se não há recorde anterior ou o total atual é maior, bateu recorde
  const bateuRecorde = !recordeAnterior || total > recordeAnterior.total;
  
  if (bateuRecorde) {
    salvarRecorde(operacaoId, limiteId, sistemaId, total);
  }
  
  return {
    bateuRecorde,
    recordeAnterior: recordeAnterior ? {
      total: recordeAnterior.total,
      atualizado_em: recordeAnterior.atualizado_em,
    } : null,
  };
}

/**
 * Limpa todos os recordes do visitante (útil para logout ou reset)
 */
export function limparRecordesVisitante() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error("Erro ao limpar recordes do visitante:", error);
  }
}
