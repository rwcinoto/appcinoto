"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar 'aleatorio' ao ENUM do tipo de operação
    await queryInterface.sequelize.query(`
      ALTER TABLE operacoes 
      MODIFY COLUMN tipo ENUM('soma', 'subtracao', 'multiplicacao', 'divisao', 'raiz', 'aleatorio') 
      NOT NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Remover 'aleatorio' do ENUM (primeiro precisamos garantir que não existem operações desse tipo)
    // Para isso, vamos remover todas as operações aleatórias primeiro (isso deve ser feito em outra migration)
    await queryInterface.sequelize.query(`
      ALTER TABLE operacoes 
      MODIFY COLUMN tipo ENUM('soma', 'subtracao', 'multiplicacao', 'divisao', 'raiz') 
      NOT NULL
    `);
  },
};

