"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna ordem na tabela operacoes após a coluna tipo
    await queryInterface.sequelize.query(`
      ALTER TABLE operacoes 
      ADD COLUMN ordem INT NULL AFTER tipo
    `);

    // Criar índice para melhorar performance
    await queryInterface.addIndex("operacoes", ["ordem"], {
      name: "idx_operacoes_ordem",
    });

    // Popular ordem inicial seguindo a lógica:
    // 1. Ordenar por tipo (soma, subtracao, multiplicacao, divisao, raiz)
    // 2. Depois por max_parcela_1
    // 3. Depois por max_parcela_2
    // 4. Depois por max_parcela_3
    const [operacoes] = await queryInterface.sequelize.query(`
      SELECT id, tipo, max_parcela_1, max_parcela_2, max_parcela_3
      FROM operacoes
      ORDER BY 
        CASE tipo
          WHEN 'soma' THEN 1
          WHEN 'subtracao' THEN 2
          WHEN 'multiplicacao' THEN 3
          WHEN 'divisao' THEN 4
          WHEN 'raiz' THEN 5
          ELSE 6
        END,
        max_parcela_1 ASC,
        COALESCE(max_parcela_2, 0) ASC,
        COALESCE(max_parcela_3, 0) ASC
    `);

    // Atualizar ordem sequencial
    for (let i = 0; i < operacoes.length; i++) {
      await queryInterface.sequelize.query(`
        UPDATE operacoes 
        SET ordem = ${i + 1} 
        WHERE id = ${operacoes[i].id}
      `);
    }

    // Tornar a coluna obrigatória após popular
    await queryInterface.changeColumn("operacoes", "ordem", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex("operacoes", "idx_operacoes_ordem");

    // Remover coluna
    await queryInterface.removeColumn("operacoes", "ordem");
  },
};

