"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Plano grátis (ordem 1)
    // Criado com criado_por NULL inicialmente (será atualizado no seeder do admin)
    await queryInterface.bulkInsert(
      "planos",
      [
        {
          nome: "Grátis",
          descricao: "Plano gratuito",
          ordem: 1,
          conjuntos_criar: 2,
          conjuntos_participar: 3,
          criado_por: null,
          atualizado_por: null,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("planos", { ordem: 1 }, {});
  },
};
