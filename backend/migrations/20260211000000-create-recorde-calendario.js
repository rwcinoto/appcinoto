"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Criar tabela recordes_calendario (recordes dos treinos de calendário)
    await queryInterface.createTable("recordes_calendario", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM(
          "data_geral",
          "dia",
          "mes",
          "ano",
          "seculo",
          "data_esse_ano",
          "data_21",
        ),
        allowNull: false,
        comment: "Tipo de treino de calendário",
      },
      id_limite: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Número de acertos no treino",
      },
      erros: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      data_recorde: {
        type: Sequelize.DATE,
        allowNull: true,
        comment:
          "Data e hora reais em que o recorde foi batido. NULL para recordes antigos.",
      },
      quantidade: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "Quantidade de treinos realizados com este recorde.",
      },
      criado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      criado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal(
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP",
        ),
        comment: "Data da última atualização do registro de recorde.",
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // Índices básicos
    await queryInterface.addIndex("recordes_calendario", ["id_usuario"]);
    await queryInterface.addIndex("recordes_calendario", ["tipo"]);
    await queryInterface.addIndex("recordes_calendario", ["id_limite"]);
    await queryInterface.addIndex("recordes_calendario", ["criado_por"]);
    await queryInterface.addIndex("recordes_calendario", ["atualizado_por"]);

    // Índice composto para rankings (filtros por tipo e limite, ordenação por total)
    await queryInterface.addIndex(
      "recordes_calendario",
      ["tipo", "id_limite", "total"],
      {
        name: "idx_recordes_calendario_ranking",
      },
    );

    // Índice único composto (um recorde por combinação usuário/tipo/limite)
    await queryInterface.addIndex(
      "recordes_calendario",
      ["id_usuario", "tipo", "id_limite"],
      {
        unique: true,
        name: "idx_recordes_calendario_unique",
      },
    );

    // Foreign keys
    await queryInterface.addConstraint("recordes_calendario", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "fk_recordes_calendario_id_usuario",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("recordes_calendario", {
      fields: ["id_limite"],
      type: "foreign key",
      name: "fk_recordes_calendario_id_limite",
      references: {
        table: "limites",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes_calendario", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_recordes_calendario_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("recordes_calendario", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_recordes_calendario_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover foreign keys
    await queryInterface.removeConstraint(
      "recordes_calendario",
      "fk_recordes_calendario_atualizado_por",
    );
    await queryInterface.removeConstraint(
      "recordes_calendario",
      "fk_recordes_calendario_criado_por",
    );
    await queryInterface.removeConstraint(
      "recordes_calendario",
      "fk_recordes_calendario_id_limite",
    );
    await queryInterface.removeConstraint(
      "recordes_calendario",
      "fk_recordes_calendario_id_usuario",
    );

    // Remover índices (o dropTable já removeria, mas mantemos explícito)
    await queryInterface.removeIndex("recordes_calendario", ["id_usuario"]);
    await queryInterface.removeIndex("recordes_calendario", ["tipo"]);
    await queryInterface.removeIndex("recordes_calendario", ["id_limite"]);
    await queryInterface.removeIndex("recordes_calendario", ["criado_por"]);
    await queryInterface.removeIndex("recordes_calendario", ["atualizado_por"]);
    await queryInterface.removeIndex(
      "recordes_calendario",
      "idx_recordes_calendario_ranking",
    );
    await queryInterface.removeIndex(
      "recordes_calendario",
      "idx_recordes_calendario_unique",
    );

    // Remover tabela
    await queryInterface.dropTable("recordes_calendario");

    // Remover ENUM tipo explicitamente se necessário (MySQL mantém o tipo)
    if (queryInterface.sequelize.getDialect() === "mysql") {
      await queryInterface.sequelize
        .query('DROP TYPE IF EXISTS "enum_recordes_calendario_tipo"')
        .catch(() => {});
    }
  },
};
