"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class RecordeSenha extends Model {
    static associate(models) {
      RecordeSenha.belongsTo(models.Usuario, {
        foreignKey: "id_usuario",
        as: "usuario",
      });
    }
  }

  RecordeSenha.init(
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
      digitos: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tamanho: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      repeticao: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tempo: {
        type: DataTypes.INTEGER,
        allowNull: false,
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
      modelName: "RecordeSenha",
      tableName: "recordes_senha",
      timestamps: false,
    },
  );

  return RecordeSenha;
};
