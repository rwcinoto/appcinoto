"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recordes_senha", {
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
      digitos: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Quantidade de dígitos disponíveis (6, 7, 8, 9 ou 10)",
      },
      tamanho: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Tamanho da senha (3, 4 ou 5)",
      },
      repeticao: {
        type: Sequelize.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
        comment: "Se permite repetição de algarismos (0=não, 1=sim)",
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Menor número de tentativas para acertar a senha (recorde)",
      },
      tempo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Tempo em milissegundos para acertar a senha",
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
        comment: "Total de treinos iniciados nessa combinação.",
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
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // Índices básicos
    await queryInterface.addIndex("recordes_senha", ["id_usuario"]);
    await queryInterface.addIndex("recordes_senha", ["criado_por"]);
    await queryInterface.addIndex("recordes_senha", ["atualizado_por"]);

    // Índice composto para ranking (menos tentativas = melhor, desempate por tempo, depois por data)
    await queryInterface.addIndex(
      "recordes_senha",
      ["digitos", "tamanho", "repeticao", "total", "tempo"],
      {
        name: "idx_recordes_senha_ranking",
      },
    );

    // Índice único composto (um recorde por combinação usuário/digitos/tamanho/repeticao)
    await queryInterface.addIndex(
      "recordes_senha",
      ["id_usuario", "digitos", "tamanho", "repeticao"],
      {
        unique: true,
        name: "idx_recordes_senha_unique",
      },
    );

    // Foreign keys
    await queryInterface.addConstraint("recordes_senha", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "fk_recordes_senha_id_usuario",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("recordes_senha", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_recordes_senha_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("recordes_senha", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_recordes_senha_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint(
      "recordes_senha",
      "fk_recordes_senha_atualizado_por",
    );
    await queryInterface.removeConstraint(
      "recordes_senha",
      "fk_recordes_senha_criado_por",
    );
    await queryInterface.removeConstraint(
      "recordes_senha",
      "fk_recordes_senha_id_usuario",
    );

    await queryInterface.removeIndex("recordes_senha", ["id_usuario"]);
    await queryInterface.removeIndex("recordes_senha", ["criado_por"]);
    await queryInterface.removeIndex("recordes_senha", ["atualizado_por"]);
    await queryInterface.removeIndex(
      "recordes_senha",
      "idx_recordes_senha_ranking",
    );
    await queryInterface.removeIndex(
      "recordes_senha",
      "idx_recordes_senha_unique",
    );

    await queryInterface.dropTable("recordes_senha");
  },
};
