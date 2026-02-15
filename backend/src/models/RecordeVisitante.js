"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RecordeVisitante extends Model {
    static associate(models) {
      RecordeVisitante.belongsTo(models.Operacao, {
        foreignKey: "id_operacao",
        as: "operacao",
      });

      RecordeVisitante.belongsTo(models.Limite, {
        foreignKey: "id_limite",
        as: "limite",
      });

      RecordeVisitante.belongsTo(models.Sistema, {
        foreignKey: "id_sistema",
        as: "sistema",
      });
    }
  }

  RecordeVisitante.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
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
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      criado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      atualizado_em: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: "RecordeVisitante",
      tableName: "recordes_visitantes",
      timestamps: false,
    }
  );

  return RecordeVisitante;
};
