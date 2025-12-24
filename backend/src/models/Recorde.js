"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Recorde extends Model {
    static associate(models) {
      Recorde.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      Recorde.belongsTo(models.Operacao, {
        foreignKey: "id_operacao",
        as: "operacao",
      });

      Recorde.belongsTo(models.Limite, {
        foreignKey: "id_limite",
        as: "limite",
      });

      Recorde.belongsTo(models.Sistema, {
        foreignKey: "id_sistema",
        as: "sistema",
      });
    }
  }

  Recorde.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      id_usuario: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_operacao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_limite: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      id_sistema: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
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
      modelName: "Recorde",
      tableName: "recordes",
      timestamps: false,
    }
  );

  return Recorde;
};
