import React, { useState } from "react";
import api from "../../services/api";
import FormSistema from "./FormSistema";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalSistema.css";

const ModalSistema = ({ sistema, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (sistema) {
        // Atualizar
        await api.put(`/sistemas/${sistema.id}`, dados);
        showSuccess("Sistema atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/sistemas", dados);
        showSuccess("Sistema criado com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalSistema - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{sistema ? "Editar Sistema" : "Criar Sistema"}</h2>
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
