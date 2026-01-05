"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Operacao extends Model {
    static associate(models) {
      Operacao.belongsTo(models.Plano, {
        foreignKey: "id_plano",
        as: "plano",
      });

      Operacao.hasMany(models.Recorde, {
        foreignKey: "id_operacao",
        as: "recordes",
      });

      // Relacionamento para operações aleatórias
      // Uma operação aleatória tem muitas operações incluídas
      Operacao.belongsToMany(models.Operacao, {
        through: "operacoes_aleatorias",
        foreignKey: "id_operacao_aleatoria",
        otherKey: "id_operacao_incluida",
        as: "operacoes_incluidas",
      });
    }
  }

  Operacao.init(
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
      tipo: {
        type: DataTypes.ENUM(
          "soma",
          "subtracao",
          "multiplicacao",
          "divisao",
          "raiz",
          "aleatorio"
        ),
        allowNull: false,
      },
      min_parcela_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      max_parcela_1: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      min_parcela_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_parcela_2: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      min_parcela_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      max_parcela_3: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      id_plano: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ordem: {
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
      modelName: "Operacao",
      tableName: "operacoes",
      timestamps: false,
    }
  );

  return Operacao;
};
