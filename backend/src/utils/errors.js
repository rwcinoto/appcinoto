/**
 * Utilitários para tratamento de erros
 */

/**
 * Classe customizada para erros de aplicação
 */
class AppError extends Error {
  constructor(message, statusCode = 500, code = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true; // Indica que é um erro operacional (esperado)
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Trata erros do Sequelize (banco de dados)
 * @param {Error} error - Erro do Sequelize
 * @returns {Object} Objeto com mensagem e statusCode
 */
const handleSequelizeError = (error) => {
  // Erro de validação
  if (error.name === "SequelizeValidationError") {
    const messages = error.errors.map((err) => err.message);
    return {
      message: messages.length === 1 ? messages[0] : "Erro de validação",
      statusCode: 400,
      errors: error.errors.map((err) => ({
        field: err.path,
        message: err.message,
      })),
    };
  }

  // Erro de constraint única (duplicata)
  if (error.name === "SequelizeUniqueConstraintError") {
    const field = error.errors[0]?.path || "campo";
    return {
      message: `Já existe um registro com este ${field}`,
      statusCode: 409,
    };
  }

  // Erro de foreign key
  if (error.name === "SequelizeForeignKeyConstraintError") {
    return {
      message: "Erro de referência: registro relacionado não encontrado",
      statusCode: 400,
    };
  }

  // Erro de banco de dados genérico
  if (error.name === "SequelizeDatabaseError") {
    console.error("Erro de banco de dados:", error.message);
    return {
      message: "Erro ao processar solicitação no banco de dados",
      statusCode: 500,
    };
  }

  // Outros erros do Sequelize
  if (error.name && error.name.startsWith("Sequelize")) {
    console.error("Erro do Sequelize:", error.message);
    return {
      message: "Erro ao processar dados",
      statusCode: 500,
    };
  }

  return null;
};

/**
 * Trata erros de validação do express-validator
 * @param {Array} errors - Array de erros do express-validator
 * @returns {Object} Objeto formatado com erros
 */
const formatValidationErrors = (errors) => {
  return {
    message: errors.length === 1 ? errors[0].msg : "Erro de validação",
    statusCode: 422,
    errors: errors.map((err) => ({
      field: err.param,
      message: err.msg,
    })),
  };
};

/**
 * Obtém mensagem de erro amigável para o usuário
 * @param {Error} error - Erro original
 * @returns {Object} Objeto com mensagem e statusCode
 */
const getErrorResponse = (error) => {
  // Erro customizado da aplicação
  if (error instanceof AppError) {
    return {
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
    };
  }

  // Erro do Sequelize
  const sequelizeError = handleSequelizeError(error);
  if (sequelizeError) {
    return sequelizeError;
  }

  // Erro JWT
  if (error.name === "JsonWebTokenError") {
    return {
      message: "Token inválido",
      statusCode: 401,
    };
  }

  if (error.name === "TokenExpiredError") {
    return {
      message: "Token expirado",
      statusCode: 401,
    };
  }

  // Erro padrão
  return {
    message: error.message || "Erro interno do servidor",
    statusCode: error.statusCode || 500,
  };
};

/**
 * Loga erro no console com informações detalhadas
 * @param {Error} error - Erro a ser logado
 * @param {Object} context - Contexto adicional (req, etc)
 */
const logError = (error, context = {}) => {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    name: error.name,
    stack: error.stack,
    ...context,
  };

  console.error("=== ERRO ===");
  console.error(JSON.stringify(errorInfo, null, 2));
  console.error("============");
};

module.exports = {
  AppError,
  handleSequelizeError,
  formatValidationErrors,
  getErrorResponse,
  logError,
};

