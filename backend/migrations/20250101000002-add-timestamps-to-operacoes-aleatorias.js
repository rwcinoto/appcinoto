"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar campos createdAt e updatedAt na tabela operacoes_aleatorias
    // O Sequelize espera esses nomes por padrão para tabelas intermediárias em belongsToMany
    // (Esta é uma tabela técnica/intermediária, então usamos o padrão do Sequelize)
    await queryInterface.addColumn("operacoes_aleatorias", "createdAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    });

    await queryInterface.addColumn("operacoes_aleatorias", "updatedAt", {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal(
        "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
      ),
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover campos de timestamp
    await queryInterface.removeColumn("operacoes_aleatorias", "updatedAt");
    await queryInterface.removeColumn("operacoes_aleatorias", "createdAt");
  },
};

