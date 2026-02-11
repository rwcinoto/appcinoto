"use strict";
const { Model } = require("sequelize");
const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  class Usuario extends Model {
    static associate(models) {
      // Um usuário pertence a um plano
      Usuario.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      // Um usuário tem muitos recordes
      Usuario.hasMany(models.Recorde, {
        foreignKey: "id_usuario",
        as: "recordes",
      });

      // Um usuário pode participar de muitos conjuntos
      Usuario.belongsToMany(models.Conjunto, {
        through: models.UsuarioConjunto,
        foreignKey: "id_usuario",
        otherKey: "id_conjunto",
        as: "conjuntos",
      });

      // Um usuário tem uma operação preferida
      Usuario.belongsTo(models.Operacao, {
        foreignKey: "operacao_id",
        as: "operacao",
      });

      // Um usuário tem um limite preferido
      Usuario.belongsTo(models.Limite, {
        foreignKey: "limite_id",
        as: "limite",
      });

      // Um usuário tem um sistema preferido
      Usuario.belongsTo(models.Sistema, {
        foreignKey: "sistema_id",
        as: "sistema",
      });

      // Um usuário foi criado por outro usuário
      Usuario.belongsTo(models.Usuario, {
        foreignKey: "criado_por",
        as: "criador",
      });
    }

    // Método para verificar senha
    async verificarSenha(senha) {
      return await bcrypt.compare(senha, this.senha);
    }

    // Hook antes de criar/atualizar para hash da senha
    static async beforeSave(usuario) {
      if (usuario.changed("senha")) {
        const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
        usuario.senha = await bcrypt.hash(usuario.senha, rounds);
      }
    }
  }

  Usuario.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      senha: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [6, 255],
        },
      },
      token_reset_senha: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      data_expiracao_reset: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM("admin", "comum", "profe"),
        allowNull: false,
        defaultValue: "comum",
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      data_vencimento_plano: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      operacao_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      limite_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sistema_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      calendario_tipo_treino: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
      ranking_global: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      data_ultimo_treino: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      criado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_por: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Usuario",
      tableName: "usuarios",
      timestamps: false,
      underscored: false,
      hooks: {
        beforeCreate: async (usuario) => {
          await Usuario.beforeSave(usuario);
        },
        beforeUpdate: async (usuario) => {
          await Usuario.beforeSave(usuario);
        },
      },
    },
  );

  return Usuario;
};
