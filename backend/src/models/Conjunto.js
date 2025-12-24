"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Conjunto extends Model {
    static associate(models) {
      Conjunto.belongsToMany(models.Usuario, {
        through: models.UsuarioConjunto,
        foreignKey: "id_conjunto",
        otherKey: "id_usuario",
        as: "usuarios",
      });
    }
  }

  Conjunto.init(
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
      ativo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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
      modelName: "Conjunto",
      tableName: "conjuntos",
      timestamps: false,
    }
  );

  return Conjunto;
};
