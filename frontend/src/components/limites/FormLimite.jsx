import React, { useEffect, useState } from "react";
import "./FormLimite.css";

const FormLimite = ({
  limite,
  planos,
  onSalvar,
  onCancelar,
  disabled = false,
}) => {
  const [formData, setFormData] = useState({
    descricao: "",
    tempo: "",
    id_plano: "",
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (limite) {
      setFormData({
        descricao: limite.descricao || "",
        tempo: limite.tempo?.toString() || "",
        id_plano: limite.id_plano?.toString() || "",
      });
    } else {
      setFormData({
        descricao: "",
        tempo: "",
        id_plano: planos.length > 0 ? planos[0].id.toString() : "",
      });
    }
  }, [limite, planos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "tempo" || name === "id_plano"
          ? value === ""
            ? ""
            : parseInt(value) || 0
          : value,
    }));
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.descricao || formData.descricao.trim().length < 3) {
      setErro("Descrição deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!formData.tempo || parseInt(formData.tempo) < 1) {
      setErro("Tempo deve ser um número inteiro positivo (em segundos)");
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
      descricao: formData.descricao.trim(),
      tempo: parseInt(formData.tempo),
      id_plano: parseInt(formData.id_plano),
    };

    onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="form-limite">
      <div className="form-group">
        <label htmlFor="descricao">Descrição *</label>
        <input
          type="text"
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          required
          minLength={3}
          disabled={disabled}
        />
        <small>Descrição do limite de tempo</small>
      </div>

      <div className="form-group">
        <label htmlFor="tempo">Tempo (em segundos) *</label>
        <input
          type="number"
          id="tempo"
          name="tempo"
          value={formData.tempo}
          onChange={handleChange}
          required
          min={1}
          disabled={disabled}
        />
        <small>Exemplo: 60 = 1 minuto, 120 = 2 minutos, 300 = 5 minutos</small>
      </div>

      <div className="form-group">
        <label htmlFor="id_plano">Plano *</label>
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
        <small>Plano ao qual este limite será associado</small>
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
          {limite ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormLimite;
