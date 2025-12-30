const { getErrorResponse, logError } = require("../utils/errors");

/**
 * Middleware global de tratamento de erros
 */
const errorHandler = (err, req, res, next) => {
  // Log do erro
  logError(err, {
    method: req.method,
    url: req.url,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.usuario?.id,
  });

  // Obter resposta formatada
  const errorResponse = getErrorResponse(err);

  // Preparar resposta
  const response = {
    message: errorResponse.message,
  };

  // Adicionar erros de validação se existirem
  if (errorResponse.errors) {
    response.errors = errorResponse.errors;
  }

  // Adicionar código de erro se existir
  if (errorResponse.code) {
    response.code = errorResponse.code;
  }

  // Adicionar stack trace apenas em desenvolvimento
  if (process.env.NODE_ENV === "development") {
    response.stack = err.stack;
  }

  // Enviar resposta
  res.status(errorResponse.statusCode).json(response);
};

module.exports = errorHandler;

