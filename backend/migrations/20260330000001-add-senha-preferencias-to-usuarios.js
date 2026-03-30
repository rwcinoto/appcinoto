"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN senha_digitos INT NULL AFTER calendario_tipo_treino
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN senha_tamanho INT NULL AFTER senha_digitos
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN senha_repeticao TINYINT(1) NULL AFTER senha_tamanho
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("usuarios", "senha_repeticao");
    await queryInterface.removeColumn("usuarios", "senha_tamanho");
    await queryInterface.removeColumn("usuarios", "senha_digitos");
  },
};
