"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Limite extends Model {
    static associate(models) {
      Limite.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Limite.hasMany(models.Recorde, {
        foreignKey: "id_limite",
        as: "recordes",
      });
    }
  }

  Limite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      descricao: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      tempo: {
        type: DataTypes.INTEGER,
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
      modelName: "Limite",
      tableName: "limites",
      timestamps: false,
    }
  );

  return Limite;
};
