"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class UsuarioConjunto extends Model {
    static associate(models) {
      UsuarioConjunto.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      UsuarioConjunto.belongsTo(models.Conjunto, {
        foreignKey: "id_conjunto",
        as: "conjunto",
      });
    }
  }

  UsuarioConjunto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_conjunto: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tipo: {
        type: DataTypes.ENUM("dono", "admin", "comum"),
        allowNull: false,
        defaultValue: "comum",
      },
      status: {
        type: DataTypes.ENUM("pendente", "aceito", "rejeitado"),
        allowNull: false,
        defaultValue: "pendente",
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
      modelName: "UsuarioConjunto",
      tableName: "usuarios_conjuntos",
      timestamps: false,
    }
  );

  return UsuarioConjunto;
};
