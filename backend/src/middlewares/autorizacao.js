const autorizarAdmin = (req, res, next) => {
  if (req.usuario && req.usuario.tipo === "admin") {
    return next();
  }
  return res
    .status(403)
    .json({ message: "Acesso negado. Apenas administradores." });
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

module.exports = {
  autorizarAdmin,
  autorizarProprioOuAdmin,
};
