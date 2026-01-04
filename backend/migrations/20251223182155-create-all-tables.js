"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // ============================================
    // PARTE 1: Criar todas as tabelas sem foreign keys
    // ============================================

    // 1. Tabela planos
    await queryInterface.createTable("planos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      ordem: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      conjuntos_criar: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      conjuntos_participar: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("planos", ["ordem"], { unique: true });
    await queryInterface.addIndex("planos", ["criado_por"]);
    await queryInterface.addIndex("planos", ["atualizado_por"]);

    // 2. Tabela usuarios
    await queryInterface.createTable("usuarios", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true,
      },
      senha: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("usuarios", ["email"], { unique: true });
    await queryInterface.addIndex("usuarios", ["id_plano"]);
    await queryInterface.addIndex("usuarios", ["tipo"]);
    await queryInterface.addIndex("usuarios", ["ativo"]);
    await queryInterface.addIndex("usuarios", ["criado_por"]);
    await queryInterface.addIndex("usuarios", ["atualizado_por"]);

    // 3. Tabela operacoes
    await queryInterface.createTable("operacoes", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM(
          "soma",
          "subtracao",
          "multiplicacao",
          "divisao",
          "raiz"
        ),
        allowNull: false,
      },
      min_parcela_1: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      max_parcela_1: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      min_parcela_2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_parcela_2: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      min_parcela_3: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      max_parcela_3: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: true,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("operacoes", ["tipo"]);
    await queryInterface.addIndex("operacoes", ["id_plano"]);
    await queryInterface.addIndex("operacoes", ["criado_por"]);
    await queryInterface.addIndex("operacoes", ["atualizado_por"]);

    // 4. Tabela limites
    await queryInterface.createTable("limites", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      tempo: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Tempo em segundos",
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("limites", ["id_plano"]);
    await queryInterface.addIndex("limites", ["tempo"]);
    await queryInterface.addIndex("limites", ["criado_por"]);
    await queryInterface.addIndex("limites", ["atualizado_por"]);

    // 5. Tabela sistemas
    await queryInterface.createTable("sistemas", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      descricao: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      tipo: {
        type: Sequelize.ENUM("natural", "romano", "binario", "inteiro"),
        allowNull: false,
      },
      id_plano: {
        type: Sequelize.INTEGER,
        allowNull: false,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("sistemas", ["tipo"]);
    await queryInterface.addIndex("sistemas", ["id_plano"]);
    await queryInterface.addIndex("sistemas", ["criado_por"]);
    await queryInterface.addIndex("sistemas", ["atualizado_por"]);

    // 6. Tabela recordes
    await queryInterface.createTable("recordes", {
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
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Número de acertos no treino",
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
        comment:
          "Data do recorde (usado para ranking). Deve ser preenchido na criação do registro.",
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("recordes", ["id_usuario"]);
    await queryInterface.addIndex("recordes", ["id_operacao"]);
    await queryInterface.addIndex("recordes", ["id_limite"]);
    await queryInterface.addIndex("recordes", ["id_sistema"]);
    await queryInterface.addIndex("recordes", ["criado_por"]);
    await queryInterface.addIndex("recordes", ["atualizado_por"]);

    // Índice composto para rankings
    await queryInterface.addIndex(
      "recordes",
      ["id_operacao", "id_limite", "id_sistema", "total"],
      {
        name: "idx_recordes_ranking",
      }
    );

    // Índice único composto (um recorde por combinação)
    await queryInterface.addIndex(
      "recordes",
      ["id_usuario", "id_operacao", "id_limite", "id_sistema"],
      {
        unique: true,
        name: "idx_recordes_unique",
      }
    );

    // 7. Tabela conjuntos
    await queryInterface.createTable("conjuntos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      nome: {
        type: Sequelize.STRING(255),
        allowNull: false,
      },
      ativo: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    await queryInterface.addIndex("conjuntos", ["ativo"]);
    await queryInterface.addIndex("conjuntos", ["criado_por"]);
    await queryInterface.addIndex("conjuntos", ["atualizado_por"]);

    // 8. Tabela usuarios_conjuntos
    await queryInterface.createTable("usuarios_conjuntos", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      id_conjunto: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: Sequelize.ENUM("dono", "admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      status: {
        type: Sequelize.ENUM("pendente", "aceito", "rejeitado"),
        allowNull: false,
        defaultValue: "pendente",
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
          "CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
        ),
      },
      atualizado_por: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
    });

    // Índice único composto (um usuário por conjunto)
    await queryInterface.addIndex(
      "usuarios_conjuntos",
      ["id_conjunto", "id_usuario"],
      {
        unique: true,
        name: "idx_usuarios_conjuntos_unique",
      }
    );

    await queryInterface.addIndex("usuarios_conjuntos", ["id_conjunto"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["id_usuario"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["tipo"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["status"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["criado_por"]);
    await queryInterface.addIndex("usuarios_conjuntos", ["atualizado_por"]);

    // ============================================
    // PARTE 2: Adicionar todas as foreign keys
    // ============================================

    // Foreign keys da tabela planos
    await queryInterface.addConstraint("planos", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_planos_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("planos", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_planos_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela usuarios
    await queryInterface.addConstraint("usuarios", {
      fields: ["id_plano"],
      type: "foreign key",
      name: "fk_usuarios_id_plano",
      references: {
        table: "planos",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("usuarios", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_usuarios_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("usuarios", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_usuarios_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela operacoes
    await queryInterface.addConstraint("operacoes", {
      fields: ["id_plano"],
      type: "foreign key",
      name: "fk_operacoes_id_plano",
      references: {
        table: "planos",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("operacoes", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_operacoes_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("operacoes", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_operacoes_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela limites
    await queryInterface.addConstraint("limites", {
      fields: ["id_plano"],
      type: "foreign key",
      name: "fk_limites_id_plano",
      references: {
        table: "planos",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("limites", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_limites_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("limites", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_limites_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela sistemas
    await queryInterface.addConstraint("sistemas", {
      fields: ["id_plano"],
      type: "foreign key",
      name: "fk_sistemas_id_plano",
      references: {
        table: "planos",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("sistemas", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_sistemas_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("sistemas", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_sistemas_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela recordes
    await queryInterface.addConstraint("recordes", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "fk_recordes_id_usuario",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("recordes", {
      fields: ["id_operacao"],
      type: "foreign key",
      name: "fk_recordes_id_operacao",
      references: {
        table: "operacoes",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes", {
      fields: ["id_limite"],
      type: "foreign key",
      name: "fk_recordes_id_limite",
      references: {
        table: "limites",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes", {
      fields: ["id_sistema"],
      type: "foreign key",
      name: "fk_recordes_id_sistema",
      references: {
        table: "sistemas",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    });

    await queryInterface.addConstraint("recordes", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_recordes_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("recordes", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_recordes_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela conjuntos
    await queryInterface.addConstraint("conjuntos", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_conjuntos_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("conjuntos", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_conjuntos_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    // Foreign keys da tabela usuarios_conjuntos
    await queryInterface.addConstraint("usuarios_conjuntos", {
      fields: ["id_conjunto"],
      type: "foreign key",
      name: "fk_usuarios_conjuntos_id_conjunto",
      references: {
        table: "conjuntos",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("usuarios_conjuntos", {
      fields: ["id_usuario"],
      type: "foreign key",
      name: "fk_usuarios_conjuntos_id_usuario",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addConstraint("usuarios_conjuntos", {
      fields: ["criado_por"],
      type: "foreign key",
      name: "fk_usuarios_conjuntos_criado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });

    await queryInterface.addConstraint("usuarios_conjuntos", {
      fields: ["atualizado_por"],
      type: "foreign key",
      name: "fk_usuarios_conjuntos_atualizado_por",
      references: {
        table: "usuarios",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover todas as foreign keys primeiro (em ordem reversa)

    // usuarios_conjuntos
    await queryInterface.removeConstraint(
      "usuarios_conjuntos",
      "fk_usuarios_conjuntos_atualizado_por"
    );
    await queryInterface.removeConstraint(
      "usuarios_conjuntos",
      "fk_usuarios_conjuntos_criado_por"
    );
    await queryInterface.removeConstraint(
      "usuarios_conjuntos",
      "fk_usuarios_conjuntos_id_usuario"
    );
    await queryInterface.removeConstraint(
      "usuarios_conjuntos",
      "fk_usuarios_conjuntos_id_conjunto"
    );

    // conjuntos
    await queryInterface.removeConstraint(
      "conjuntos",
      "fk_conjuntos_atualizado_por"
    );
    await queryInterface.removeConstraint(
      "conjuntos",
      "fk_conjuntos_criado_por"
    );

    // recordes
    await queryInterface.removeConstraint(
      "recordes",
      "fk_recordes_atualizado_por"
    );
    await queryInterface.removeConstraint("recordes", "fk_recordes_criado_por");
    await queryInterface.removeConstraint("recordes", "fk_recordes_id_sistema");
    await queryInterface.removeConstraint("recordes", "fk_recordes_id_limite");
    await queryInterface.removeConstraint(
      "recordes",
      "fk_recordes_id_operacao"
    );
    await queryInterface.removeConstraint("recordes", "fk_recordes_id_usuario");

    // sistemas
    await queryInterface.removeConstraint(
      "sistemas",
      "fk_sistemas_atualizado_por"
    );
    await queryInterface.removeConstraint("sistemas", "fk_sistemas_criado_por");
    await queryInterface.removeConstraint("sistemas", "fk_sistemas_id_plano");

    // limites
    await queryInterface.removeConstraint(
      "limites",
      "fk_limites_atualizado_por"
    );
    await queryInterface.removeConstraint("limites", "fk_limites_criado_por");
    await queryInterface.removeConstraint("limites", "fk_limites_id_plano");

    // operacoes
    await queryInterface.removeConstraint(
      "operacoes",
      "fk_operacoes_atualizado_por"
    );
    await queryInterface.removeConstraint(
      "operacoes",
      "fk_operacoes_criado_por"
    );
    await queryInterface.removeConstraint("operacoes", "fk_operacoes_id_plano");

    // usuarios
    await queryInterface.removeConstraint(
      "usuarios",
      "fk_usuarios_atualizado_por"
    );
    await queryInterface.removeConstraint("usuarios", "fk_usuarios_criado_por");
    await queryInterface.removeConstraint("usuarios", "fk_usuarios_id_plano");

    // planos
    await queryInterface.removeConstraint("planos", "fk_planos_atualizado_por");
    await queryInterface.removeConstraint("planos", "fk_planos_criado_por");

    // Remover todas as tabelas (em ordem reversa)
    await queryInterface.dropTable("usuarios_conjuntos");
    await queryInterface.dropTable("conjuntos");
    await queryInterface.dropTable("recordes");
    await queryInterface.dropTable("sistemas");
    await queryInterface.dropTable("limites");
    await queryInterface.dropTable("operacoes");
    await queryInterface.dropTable("usuarios");
    await queryInterface.dropTable("planos");
  },
};
