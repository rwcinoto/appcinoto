"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna quantidade na tabela recordes após a coluna total
    // O DEFAULT 1 garante que registros existentes receberão o valor 1
    await queryInterface.sequelize.query(`
      ALTER TABLE recordes 
      ADD COLUMN quantidade INT NOT NULL DEFAULT 1 AFTER total
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna
    await queryInterface.removeColumn("recordes", "quantidade");
  },
};
