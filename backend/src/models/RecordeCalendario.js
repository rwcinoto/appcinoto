"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RecordeCalendario extends Model {
    static associate(models) {
      // Usuário dono do recorde
      RecordeCalendario.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });

      // Limite de tempo usado no treino
      RecordeCalendario.belongsTo(models.Limite, {
        foreignKey: "id_limite",
        as: "limite",
      });
    }
  }

  RecordeCalendario.init(
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
      tipo: {
        type: DataTypes.ENUM("data_geral", "mes", "ano", "seculo", "data_21"),
        allowNull: false,
      },
      id_limite: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      erros: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      data_recorde: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      quantidade: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
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
      modelName: "RecordeCalendario",
      tableName: "recordes_calendario",
      timestamps: false,
    }
  );

  return RecordeCalendario;
};

