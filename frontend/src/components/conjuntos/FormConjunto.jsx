import React, { useState, useEffect } from "react";
import ErrorMessage from "../common/ErrorMessage";
import "./FormConjunto.css";

const FormConjunto = ({ conjunto, onSalvar, onCancelar, disabled = false }) => {
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    if (conjunto) {
      setNome(conjunto.nome || "");
    } else {
      setNome("");
    }
    setErro("");
  }, [conjunto]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setErro("");

    // Validação
    if (!nome.trim()) {
      setErro("Nome é obrigatório");
      return;
    }

    if (nome.trim().length < 1) {
      setErro("Nome não pode estar vazio");
      return;
    }

    onSalvar({ nome: nome.trim() });
  };

  return (
    <form className="form-conjunto" onSubmit={handleSubmit}>
      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      <div className="form-group">
        <label htmlFor="nome">Nome do conjunto</label>
        <input
          type="text"
          id="nome"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite o nome do conjunto"
          disabled={disabled}
          required
        />
      </div>

      <div className="form-actions">
        <button type="button" onClick={onCancelar} disabled={disabled}>
          Cancelar
        </button>
        <button type="submit" disabled={disabled}>
          {disabled ? "Salvando..." : conjunto ? "Atualizar" : "Criar"}
        </button>
      </div>
    </form>
  );
};

export default FormConjunto;

