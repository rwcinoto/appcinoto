const autorizarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Acesso negado. Apenas administradores." });
};

const autorizarAdminOuProfe = (req, res, next) => {
  if (req.usuario && (req.usuario.tipo === "admin" || req.usuario.tipo === "profe")) {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Acesso negado. Apenas administradores ou professores." });
};

const autorizarProprioOuAdmin = (req, res, next) => {
  const userId = parseInt(req.params.id);
  if (
    req.usuario &&
    (req.usuario.tipo === "admin" || req.usuario.id === userId)
  ) {
    return next();
  }
  return res.status(403).json({
    message: "Acesso negado. Você só pode acessar seus próprios dados.",
  });
};

const autorizarProprioOuAdminOuProfe = (req, res, next) => {
  const userId = parseInt(req.params.id);
  if (
    req.usuario &&
    (req.usuario.tipo === "admin" || req.usuario.tipo === "profe" || req.usuario.id === userId)
  ) {
    return next();
  }
  return res.status(403).json({
    message: "Acesso negado. Você só pode acessar seus próprios dados ou dados de usuários criados por você.",
  });
};

module.exports = {
  autorizarAdmin,
  autorizarAdminOuProfe,
  autorizarProprioOuAdmin,
  autorizarProprioOuAdminOuProfe,
};
