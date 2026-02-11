"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna calendario_tipo_treino após data_ultimo_treino
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN calendario_tipo_treino VARCHAR(20) NULL AFTER sistema_id
    `);

    // Índice opcional para filtros futuros por tipo de treino de calendário
    await queryInterface.addIndex("usuarios", ["calendario_tipo_treino"], {
      name: "idx_usuarios_calendario_tipo_treino",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "usuarios",
      "idx_usuarios_calendario_tipo_treino",
    );
    await queryInterface.removeColumn("usuarios", "calendario_tipo_treino");
  },
};
