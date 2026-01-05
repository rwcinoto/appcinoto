"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela de relacionamento N:N para operações aleatórias
    await queryInterface.createTable("operacoes_aleatorias", {
      id_operacao_aleatoria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "operacoes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      id_operacao_incluida: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "operacoes",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    });

    // Adicionar chave primária composta
    await queryInterface.addConstraint("operacoes_aleatorias", {
      fields: ["id_operacao_aleatoria", "id_operacao_incluida"],
      type: "primary key",
      name: "pk_operacoes_aleatorias",
    });

    // Adicionar índices para melhorar performance
    await queryInterface.addIndex("operacoes_aleatorias", ["id_operacao_aleatoria"], {
      name: "idx_operacoes_aleatorias_operacao",
    });
    await queryInterface.addIndex("operacoes_aleatorias", ["id_operacao_incluida"], {
      name: "idx_operacoes_aleatorias_incluida",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índices
    await queryInterface.removeIndex("operacoes_aleatorias", "idx_operacoes_aleatorias_operacao");
    await queryInterface.removeIndex("operacoes_aleatorias", "idx_operacoes_aleatorias_incluida");

    // Remover tabela
    await queryInterface.dropTable("operacoes_aleatorias");
  },
};

