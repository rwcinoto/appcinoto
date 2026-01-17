"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar colunas após o campo "ativo" e antes de "criado_em"
    // Adicionar coluna operacao_id
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN operacao_id INT NULL AFTER ativo
    `);

    // Adicionar coluna limite_id
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN limite_id INT NULL AFTER operacao_id
    `);

    // Adicionar coluna sistema_id
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN sistema_id INT NULL AFTER limite_id
    `);

    // Adicionar coluna ranking_global
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN ranking_global BOOLEAN NOT NULL DEFAULT true AFTER sistema_id
    `);

    // Adicionar coluna data_ultimo_treino
    await queryInterface.sequelize.query(`
      ALTER TABLE usuarios
      ADD COLUMN data_ultimo_treino DATE NULL AFTER ranking_global
    `);

    // Adicionar índices para melhor performance
    await queryInterface.addIndex("usuarios", ["operacao_id"]);
    await queryInterface.addIndex("usuarios", ["limite_id"]);
    await queryInterface.addIndex("usuarios", ["sistema_id"]);

    // Adicionar foreign keys
    await queryInterface.addConstraint("usuarios", {
      fields: ["operacao_id"],
      type: "foreign key",
      name: "fk_usuarios_operacao_id",
      references: {
        table: "operacoes",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("usuarios", {
      fields: ["limite_id"],
      type: "foreign key",
      name: "fk_usuarios_limite_id",
      references: {
        table: "limites",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("usuarios", {
      fields: ["sistema_id"],
      type: "foreign key",
      name: "fk_usuarios_sistema_id",
      references: {
        table: "sistemas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover foreign keys primeiro
    await queryInterface.removeConstraint(
      "usuarios",
      "fk_usuarios_sistema_id"
    );
    await queryInterface.removeConstraint(
      "usuarios",
      "fk_usuarios_limite_id"
    );
    await queryInterface.removeConstraint(
      "usuarios",
      "fk_usuarios_operacao_id"
    );

    // Remover índices
    await queryInterface.removeIndex("usuarios", ["sistema_id"]);
    await queryInterface.removeIndex("usuarios", ["limite_id"]);
    await queryInterface.removeIndex("usuarios", ["operacao_id"]);

    // Remover colunas
    await queryInterface.removeColumn("usuarios", "data_ultimo_treino");
    await queryInterface.removeColumn("usuarios", "ranking_global");
    await queryInterface.removeColumn("usuarios", "sistema_id");
    await queryInterface.removeColumn("usuarios", "limite_id");
    await queryInterface.removeColumn("usuarios", "operacao_id");
  },
};
