/**
 * Utilitário para tratamento de erros de forma consistente
 */

/**
 * Extrai mensagem de erro amigável de um erro de API
 * @param {Error} error - Objeto de erro
 * @returns {string} Mensagem de erro amigável
 */
export const getErrorMessage = (error) => {
  // Erro de rede (sem conexão)
  if (!error.response) {
    if (error.message === "Network Error" || error.code === "ERR_NETWORK") {
      return "Erro de conexão. Verifique sua internet e tente novamente.";
    }
    if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
      return "Tempo de conexão esgotado. Tente novamente.";
    }
    return "Erro de conexão. Tente novamente.";
  }

  // Erro HTTP do servidor
  const { status, data } = error.response;

  // Mensagem personalizada do backend (verificar antes das mensagens genéricas)
  if (data?.message) {
    return data.message;
  }

  // Erro 401 - Não autorizado
  if (status === 401) {
    return "Sessão expirada. Por favor, faça login novamente.";
  }

  // Erro 403 - Sem permissão
  if (status === 403) {
    return "Você não tem permissão para realizar esta ação.";
  }

  // Erro 404 - Não encontrado
  if (status === 404) {
    return "Recurso não encontrado.";
  }

  // Erro 400 - Bad Request (validação)
  if (status === 400) {
    // Mensagem personalizada do backend
    if (data?.message) {
      return data.message;
    }
    // Erros de validação do express-validator
    if (data?.errors && Array.isArray(data.errors)) {
      const firstError = data.errors[0];
      return firstError.msg || firstError.message || "Erro de validação. Verifique os dados informados.";
    }
    return "Dados inválidos. Verifique as informações e tente novamente.";
  }

  // Erro 422 - Validação
  if (status === 422 && data?.errors && Array.isArray(data.errors)) {
    const firstError = data.errors[0];
    return firstError.msg || firstError.message || "Erro de validação. Verifique os dados informados.";
  }

  // Erro 500+ - Erro do servidor
  if (status >= 500) {
    return "Erro no servidor. Tente novamente mais tarde.";
  }

  // Mensagem padrão
  return "Ocorreu um erro. Tente novamente.";
};

/**
 * Loga erro no console apenas em desenvolvimento
 * @param {string} context - Contexto onde o erro ocorreu
 * @param {Error} error - Objeto de erro
 */
export const logError = (context, error) => {
  if (process.env.NODE_ENV === "development") {
    console.error(`[${context}]`, error);
    if (error.response) {
      console.error("Response:", error.response.data);
      console.error("Status:", error.response.status);
    }
  }
};

