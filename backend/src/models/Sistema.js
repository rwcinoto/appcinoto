"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Sistema extends Model {
    static associate(models) {
      Sistema.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Sistema.hasMany(models.Recorde, {
        foreignKey: "id_sistema",
        as: "recordes",
      });
    }
  }

  Sistema.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      tipo: {
        type: DataTypes.ENUM("natural", "romano", "binario", "inteiro", "decimal"),
        allowNull: false,
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "Sistema",
      tableName: "sistemas",
      timestamps: false,
    }
  );

  return Sistema;
};
