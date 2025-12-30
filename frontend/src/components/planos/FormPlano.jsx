import React, { useEffect, useState } from "react";
import "./FormPlano.css";

const FormPlano = ({ plano, onSalvar, onCancelar, disabled = false }) => {
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    ordem: "",
    conjuntos_criar: 0,
    conjuntos_participar: 0,
  });
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (plano) {
      setFormData({
        nome: plano.nome || "",
        descricao: plano.descricao || "",
        ordem: plano.ordem?.toString() || "",
        conjuntos_criar: plano.conjuntos_criar || 0,
        conjuntos_participar: plano.conjuntos_participar || 0,
      });
    } else {
      setFormData({
        nome: "",
        descricao: "",
        ordem: "",
        conjuntos_criar: 0,
        conjuntos_participar: 0,
      });
    }
  }, [plano]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "ordem" ||
        name === "conjuntos_criar" ||
        name === "conjuntos_participar"
          ? value === ""
            ? ""
            : parseInt(value) || 0
          : value,
    }));
    setErro("");
  };

  const validarFormulario = () => {
    if (!formData.nome || formData.nome.trim().length < 3) {
      setErro("Nome deve ter no mínimo 3 caracteres");
      return false;
    }

    if (!formData.ordem || parseInt(formData.ordem) < 1) {
      setErro("Ordem deve ser um número inteiro positivo");
      return false;
    }

    if (
      formData.conjuntos_criar !== undefined &&
      parseInt(formData.conjuntos_criar) < 0
    ) {
      setErro("Conjuntos criar não pode ser negativo");
      return false;
    }

    if (
      formData.conjuntos_participar !== undefined &&
      parseInt(formData.conjuntos_participar) < 0
    ) {
      setErro("Conjuntos participar não pode ser negativo");
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
      descricao: formData.descricao.trim() || null,
      ordem: parseInt(formData.ordem),
      conjuntos_criar: parseInt(formData.conjuntos_criar) || 0,
      conjuntos_participar: parseInt(formData.conjuntos_participar) || 0,
    };

    onSalvar(dados);
  };

  return (
    <form onSubmit={handleSubmit} className="form-plano">
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
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label htmlFor="descricao">Descrição</label>
        <textarea
          id="descricao"
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
          rows={3}
          disabled={disabled}
        />
      </div>

      <div className="form-group">
        <label htmlFor="ordem">Ordem</label>
        <input
          type="number"
          id="ordem"
          name="ordem"
          value={formData.ordem}
          onChange={handleChange}
          required
          min={1}
          disabled={disabled}
        />
        <small>A ordem deve ser única. Planos são ordenados por este valor.</small>
      </div>

      <div className="form-group">
        <label htmlFor="conjuntos_criar">Conjuntos criar</label>
        <input
          type="number"
          id="conjuntos_criar"
          name="conjuntos_criar"
          value={formData.conjuntos_criar}
          onChange={handleChange}
          required
          min={0}
          disabled={disabled}
        />
        <small>Número máximo de conjuntos que usuários deste plano podem criar.</small>
      </div>

      <div className="form-group">
        <label htmlFor="conjuntos_participar">Conjuntos participar</label>
        <input
          type="number"
          id="conjuntos_participar"
          name="conjuntos_participar"
          value={formData.conjuntos_participar}
          onChange={handleChange}
          required
          min={0}
          disabled={disabled}
        />
        <small>Número máximo de conjuntos que usuários deste plano podem participar.</small>
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
          {plano ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormPlano;

