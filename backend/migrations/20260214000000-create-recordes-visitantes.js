"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recordes_visitantes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_operacao: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_limite: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_sistema: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
    });

    await queryInterface.addIndex("recordes_visitantes", ["id_operacao"]);
    await queryInterface.addIndex("recordes_visitantes", ["id_limite"]);
    await queryInterface.addIndex("recordes_visitantes", ["id_sistema"]);

    // Índice único composto (uma linha por combinação operacao+limite+sistema)
    await queryInterface.addIndex(
      "recordes_visitantes",
      ["id_operacao", "id_limite", "id_sistema"],
      {
        unique: true,
        name: "idx_recordes_visitantes_unique",
      }
    );

    // Foreign keys
    await queryInterface.addConstraint("recordes_visitantes", {
      fields: ["id_operacao"],
      type: "foreign key",
      name: "fk_recordes_visitantes_id_operacao",
      references: {
        table: "operacoes",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes_visitantes", {
      fields: ["id_limite"],
      type: "foreign key",
      name: "fk_recordes_visitantes_id_limite",
      references: {
        table: "limites",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes_visitantes", {
      fields: ["id_sistema"],
      type: "foreign key",
      name: "fk_recordes_visitantes_id_sistema",
      references: {
        table: "sistemas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "recordes_visitantes",
      "fk_recordes_visitantes_id_sistema"
    );
    await queryInterface.removeConstraint(
      "recordes_visitantes",
      "fk_recordes_visitantes_id_limite"
    );
    await queryInterface.removeConstraint(
      "recordes_visitantes",
      "fk_recordes_visitantes_id_operacao"
    );
    await queryInterface.dropTable("recordes_visitantes");
  },
};
