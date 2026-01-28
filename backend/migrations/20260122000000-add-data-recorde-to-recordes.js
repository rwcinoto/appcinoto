"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna data_recorde na tabela recordes após a coluna erros
    // Campo anulável: NULL indica que não temos essa informação (recordes antigos)
    // Valor datetime indica a data real em que o recorde foi batido
    await queryInterface.sequelize.query(`
      ALTER TABLE recordes
      ADD COLUMN data_recorde DATETIME NULL DEFAULT NULL AFTER erros
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover coluna
    await queryInterface.removeColumn("recordes", "data_recorde");
  },
};
