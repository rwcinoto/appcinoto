import React, { useState } from "react";
import api from "../../services/api";
import FormPlano from "./FormPlano";
import "./ModalPlano.css";

const ModalPlano = ({ plano, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (plano) {
        // Atualizar
        await api.put(`/planos/${plano.id}`, dados);
      } else {
        // Criar
        await api.post("/planos", dados);
      }
      onSalvo();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao salvar plano";
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{plano ? "Editar Plano" : "Criar Plano"}</h2>
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
          <FormPlano
            plano={plano}
            onSalvar={handleSalvar}
            onCancelar={onFechar}
            disabled={salvando}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalPlano;

