import React, { useEffect, useState } from "react";
import "./FormUsuario.css";

const FormUsuario = ({ usuario, planos, onSalvar, onCancelar, disabled = false }) => {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "comum",
    id_plano: "",
    ativo: true,
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (usuario) {
      setFormData({
        nome: usuario.nome || "",
        email: usuario.email || "",
        senha: "",
        tipo: usuario.tipo || "comum",
        id_plano: usuario.id_plano?.toString() || "",
        ativo: usuario.ativo !== undefined ? usuario.ativo : true,
      });
    } else if (planos.length > 0) {
      // Se for criação e há planos, selecionar o primeiro por padrão
      setFormData((prev) => ({
        ...prev,
        id_plano: planos[0].id.toString(),
      }));
    }
  }, [usuario, planos]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.nome || formData.nome.trim().length < 3) {
      setErro("Nome deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!formData.email || !formData.email.includes("@")) {
      setErro("Email inválido");
      return false;
    }

    if (!usuario && !formData.senha) {
      setErro("Senha é obrigatória para novos usuários");
      return false;
    }

    if (formData.senha && formData.senha.length < 6) {
      setErro("Senha deve ter no mínimo 6 caracteres");
      return false;
    }

    if (!formData.id_plano) {
      setErro("Plano é obrigatório");
      return false;
    }

    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validarFormulario()) {
      return;
    }

    const dados = {
      nome: formData.nome.trim(),
      email: formData.email.trim(),
      tipo: formData.tipo,
      id_plano: parseInt(formData.id_plano),
      ativo: formData.ativo,
    };

    if (formData.senha) {
      dados.senha = formData.senha;
    }

    onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="form-usuario">
      <div className="form-group">
        <label htmlFor="nome">Nome</label>
        <input
          type="text"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          required
          minLength={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="senha">
          Senha {usuario ? "(opcional)" : ""}
        </label>
        <input
          type="password"
          id="senha"
          name="senha"
          value={formData.senha}
          onChange={handleChange}
          minLength={6}
          placeholder={usuario ? "Deixe em branco para manter" : ""}
        />
      </div>

      <div className="form-group">
        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
        >
          <option value="comum">Comum</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="id_plano">Plano</label>
        <select
          id="id_plano"
          name="id_plano"
          value={formData.id_plano}
          onChange={handleChange}
          required
        >
          <option value="">Selecione um plano</option>
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group checkbox-group">
        <label>
          <input
            type="checkbox"
            name="ativo"
            checked={formData.ativo}
            onChange={handleChange}
          />
          Usuário ativo
        </label>
      </div>

      {erro && <div className="erro">{erro}</div>}

      <div className="form-actions">
        <button type="button" onClick={onCancelar} className="btn-cancelar" disabled={disabled}>
          Cancelar
        </button>
        <button type="submit" className="btn-salvar" disabled={disabled}>
          {usuario ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormUsuario;

