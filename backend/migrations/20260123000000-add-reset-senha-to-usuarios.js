"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna token_reset_senha
    await queryInterface.addColumn("usuarios", "token_reset_senha", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "senha",
    });

    // Adicionar coluna data_expiracao_reset
    await queryInterface.addColumn("usuarios", "data_expiracao_reset", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "token_reset_senha",
    });

    // Adicionar índice para melhor performance nas buscas por token
    await queryInterface.addIndex("usuarios", ["token_reset_senha"]);
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex("usuarios", ["token_reset_senha"]);

    // Remover colunas
    await queryInterface.removeColumn("usuarios", "data_expiracao_reset");
    await queryInterface.removeColumn("usuarios", "token_reset_senha");
  },
};
