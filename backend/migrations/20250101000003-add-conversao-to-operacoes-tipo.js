"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar 'conversao' ao ENUM do tipo de operação
    await queryInterface.sequelize.query(`
      ALTER TABLE operacoes 
      MODIFY COLUMN tipo ENUM('soma', 'subtracao', 'multiplicacao', 'divisao', 'raiz', 'aleatorio', 'conversao') 
      NOT NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover 'conversao' do ENUM (primeiro precisamos garantir que não existem operações desse tipo)
    await queryInterface.sequelize.query(`
      ALTER TABLE operacoes 
      MODIFY COLUMN tipo ENUM('soma', 'subtracao', 'multiplicacao', 'divisao', 'raiz', 'aleatorio') 
      NOT NULL
    `);
  },
};
