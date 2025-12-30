import React, { useState } from "react";
import api from "../../services/api";
import FormLimite from "./FormLimite";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalLimite.css";

const ModalLimite = ({ limite, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (limite) {
        // Atualizar
        await api.put(`/limites/${limite.id}`, dados);
        showSuccess("Limite atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/limites", dados);
        showSuccess("Limite criado com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalLimite - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{limite ? "Editar Limite" : "Criar Limite"}</h2>
          <button className="modal-close" onClick={onFechar} aria-label="Fechar modal">
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && (
            <ErrorMessage
              message={erro}
              type="error"
              dismissible
              onDismiss={() => setErro("")}
            />
          )}
          <FormLimite
            limite={limite}
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

export default ModalLimite;
