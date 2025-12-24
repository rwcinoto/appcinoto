import React, { useState } from "react";
import api from "../../services/api";
import FormSistema from "./FormSistema";
import "./ModalSistema.css";

const ModalSistema = ({ sistema, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (sistema) {
        // Atualizar
        await api.put(`/sistemas/${sistema.id}`, dados);
      } else {
        // Criar
        await api.post("/sistemas", dados);
      }
      onSalvo();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao salvar sistema";
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sistema ? "Editar Sistema" : "Criar Sistema"}</h2>
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
          <FormSistema
            sistema={sistema}
            planos={planos}
            onSalvar={handleSalvar}
            onCancelar={onFechar}
            disabled={salvando}
          />
        </div>
      </div>
    </div>
  );
};

export default ModalSistema;
