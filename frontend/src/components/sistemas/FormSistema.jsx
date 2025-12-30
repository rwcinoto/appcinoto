import React, { useEffect, useState } from "react";
import "./FormSistema.css";

const FormSistema = ({
  sistema,
  planos,
  onSalvar,
  onCancelar,
  disabled = false,
}) => {
  const [formData, setFormData] = useState({
    descricao: "",
    tipo: "arabico",
    id_plano: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (sistema) {
      setFormData({
        descricao: sistema.descricao || "",
        tipo: sistema.tipo || "arabico",
        id_plano: sistema.id_plano?.toString() || "",
      });
    } else {
      setFormData({
        descricao: "",
        tipo: "arabico",
        id_plano: planos.length > 0 ? planos[0].id.toString() : "",
      });
    }
  }, [sistema, planos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "id_plano"
          ? value === ""
            ? ""
            : parseInt(value) || 0
          : value,
    }));
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.tipo) {
      setErro("Tipo é obrigatório");
      return false;
    }

    if (!formData.id_plano || parseInt(formData.id_plano) < 1) {
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
      descricao: formData.descricao.trim() || null,
      tipo: formData.tipo,
      id_plano: parseInt(formData.id_plano),
    };

    onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="form-sistema">
      <div className="form-group">
        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={formData.tipo}
          onChange={handleChange}
          required
          disabled={disabled}
        >
          <option value="arabico">Arábico</option>
          <option value="romano">Romano</option>
          <option value="binario">Binário</option>
        </select>
        <small>Sistema numérico usado nos cálculos</small>
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          disabled={disabled}
          placeholder="Descrição opcional do sistema"
        />
        <small>Descrição opcional do sistema numérico</small>
      </div>

      <div className="form-group">
        <label htmlFor="id_plano">Plano</label>
        <select
          id="id_plano"
          name="id_plano"
          value={formData.id_plano}
          onChange={handleChange}
          required
          disabled={disabled}
        >
          <option value="">Selecione um plano</option>
          {planos.map((plano) => (
            <option key={plano.id} value={plano.id}>
              {plano.nome}
            </option>
          ))}
        </select>
        <small>Plano ao qual este sistema será associado</small>
      </div>

      {erro && <div className="erro">{erro}</div>}

      <div className="form-actions">
        <button
          type="button"
          onClick={onCancelar}
          className="btn-cancelar"
          disabled={disabled}
        >
          Cancelar
        </button>
        <button type="submit" className="btn-salvar" disabled={disabled}>
          {sistema ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormSistema;
