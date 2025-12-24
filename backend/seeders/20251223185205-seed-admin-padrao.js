"use strict";
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    // Buscar plano grátis
    const [planos] = await queryInterface.sequelize.query(
      "SELECT id FROM planos WHERE ordem = 1 LIMIT 1"
    );

    if (planos.length === 0) {
      throw new Error(
        "Plano grátis não encontrado. Execute o seeder de planos primeiro."
      );
    }

    const planoId = planos[0].id;
    const rounds = parseInt(process.env.BCRYPT_ROUNDS) || 10;
    const senhaHash = await bcrypt.hash("admin123", rounds);

    // Criar usuário admin
    await queryInterface.bulkInsert(
      "usuarios",
      [
        {
          email: "admin@contas.com",
          senha: senhaHash,
          nome: "Administrador",
          tipo: "admin",
          id_plano: planoId,
          ativo: true,
          criado_por: null, // Primeiro usuário, então criado_por é NULL
          atualizado_por: null,
          criado_em: new Date(),
          atualizado_em: new Date(),
        },
      ],
      {}
    );

    // Buscar o ID do admin recém-criado
    const [admins] = await queryInterface.sequelize.query(
      "SELECT id FROM usuarios WHERE email = 'admin@contas.com' LIMIT 1"
    );

    if (admins.length > 0) {
      const adminId = admins[0].id;

      // Atualizar o plano grátis para ter o admin como criado_por e atualizado_por
      await queryInterface.sequelize.query(
        `UPDATE planos SET criado_por = ${adminId}, atualizado_por = ${adminId} WHERE ordem = 1`
      );

      // Atualizar o próprio admin para ter criado_por e atualizado_por como ele mesmo
      await queryInterface.sequelize.query(
        `UPDATE usuarios SET criado_por = ${adminId}, atualizado_por = ${adminId} WHERE email = 'admin@contas.com'`
      );
    }
  },

  async down(queryInterface, Sequelize) {
    // Primeiro atualizar o plano grátis para NULL novamente
    await queryInterface.sequelize.query(
      "UPDATE planos SET criado_por = NULL, atualizado_por = NULL WHERE ordem = 1"
    );

    // Depois deletar o admin
    await queryInterface.bulkDelete(
      "usuarios",
      { email: "admin@contas.com" },
      {}
    );
  },
};
