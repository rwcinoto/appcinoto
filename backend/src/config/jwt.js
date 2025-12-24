require("dotenv").config();

module.exports = {
  secret: process.env.JWT_SECRET || "chave_secret_do_cinotoapp",
  expiresIn: process.env.JWT_EXPIRES_IN || "24h",
};
