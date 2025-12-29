import React, { useState } from "react";
import api from "../../services/api";
import FormConjunto from "./FormConjunto";
import "./ModalConjunto.css";

const ModalConjunto = ({ conjunto, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (conjunto) {
        // Atualizar
        await api.put(`/conjuntos/${conjunto.id}`, dados);
      } else {
        // Criar
        await api.post("/conjuntos", dados);
      }
      onSalvo();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao salvar conjunto";
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{conjunto ? "Editar conjunto" : "Criar conjunto"}</h2>
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
          <FormConjunto
            conjunto={conjunto}
            onSalvar={handleSalvar}
            onCancelar={onFechar}
            disabled={salvando}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalConjunto;

