"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna data_vencimento_plano
    await queryInterface.addColumn("usuarios", "data_vencimento_plano", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "id_plano",
    });

    // Adicionar índice para melhor performance nas buscas por data de vencimento
    await queryInterface.addIndex("usuarios", ["data_vencimento_plano"]);
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex("usuarios", ["data_vencimento_plano"]);

    // Remover coluna
    await queryInterface.removeColumn("usuarios", "data_vencimento_plano");
  },
};
