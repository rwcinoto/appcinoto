"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna erros na tabela recordes após a coluna total
    // Campo anulável: NULL indica que não temos essa informação (treinos antigos)
    // Valor 0 ou maior indica a quantidade real de erros (treinos novos)
    await queryInterface.sequelize.query(`
      ALTER TABLE recordes
      ADD COLUMN erros INT NULL DEFAULT NULL AFTER total
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna
    await queryInterface.removeColumn("recordes", "erros");
  },
};
