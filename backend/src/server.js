require("dotenv").config();
const app = require("./app");
const db = require("./models");

const PORT = process.env.PORT || 3000;

// Sincronizar modelos com banco (apenas em desenvolvimento)
if (process.env.NODE_ENV === "development") {
  db.sequelize
    .authenticate()
    .then(() => {
      console.log("Conexão com banco de dados estabelecida.");
    })
    .catch((err) => {
      console.error("Erro ao conectar com banco de dados:", err);
    });
}

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
