"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Plano extends Model {
    static associate(models) {
      // Um plano tem muitos usuários
      Plano.hasMany(models.Usuario, {
        foreignKey: "id_plano",
        as: "usuarios",
      });

      // Um plano tem muitas operações
      Plano.hasMany(models.Operacao, {
        foreignKey: "id_plano",
        as: "operacoes",
      });

      // Um plano tem muitos limites
      Plano.hasMany(models.Limite, {
        foreignKey: "id_plano",
        as: "limites",
      });

      // Um plano tem muitos sistemas
      Plano.hasMany(models.Sistema, {
        foreignKey: "id_plano",
        as: "sistemas",
      });
    }
  }

  Plano.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      ordem: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      conjuntos_criar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      conjuntos_participar: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
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
      modelName: "Plano",
      tableName: "planos",
      timestamps: false,
      underscored: false,
    }
  );

  return Plano;
};
