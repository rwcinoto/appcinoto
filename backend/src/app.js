const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");

const app = express();

// Middlewares de segurança
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3001",
    credentials: true,
  })
);

// Middleware para parsing JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir arquivos estáticos do frontend (em produção)
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../../frontend/build")));
}

// Rotas da API
app.use("/api", require("./routes"));

// Rota para frontend (em produção)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/build/index.html"));
  });
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || "Erro interno do servidor",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
