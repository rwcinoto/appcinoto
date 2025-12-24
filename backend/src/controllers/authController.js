const { validationResult } = require("express-validator");
const authService = require("../services/authService");

class AuthController {
  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, senha } = req.body;
      const resultado = await authService.login(email, senha);

      return res.json(resultado);
    } catch (error) {
      return res.status(401).json({ message: error.message });
    }
  }

  async me(req, res) {
    try {
      const usuario = await req.usuario.reload({
        include: [{ association: "plano" }],
      });

      return res.json({
        id: usuario.id,
        email: usuario.email,
        nome: usuario.nome,
        tipo: usuario.tipo,
        id_plano: usuario.id_plano,
        plano: usuario.plano,
      });
    } catch (error) {
      return res.status(500).json({ message: "Erro ao buscar usuário" });
    }
  }
}

module.exports = new AuthController();
