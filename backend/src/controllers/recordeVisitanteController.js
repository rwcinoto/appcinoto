"use strict";

const recordeService = require("../services/recordeService");

class RecordeVisitanteController {
  /**
   * Lista quantidade de treinos por tipo realizados por visitantes.
   * Apenas admin.
   */
  async listar(req, res) {
    try {
      const recordes = await recordeService.listarRecordesVisitantes();
      return res.json(recordes);
    } catch (error) {
      console.error("Erro ao listar recordes de visitantes:", error);
      return res.status(500).json({
        message: "Erro ao listar recordes de visitantes",
        error: error.message,
      });
    }
  }
}

module.exports = new RecordeVisitanteController();
