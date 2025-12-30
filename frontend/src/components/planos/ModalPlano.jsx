import React, { useState } from "react";
import api from "../../services/api";
import FormPlano from "./FormPlano";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalPlano.css";

const ModalPlano = ({ plano, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (plano) {
        // Atualizar
        await api.put(`/planos/${plano.id}`, dados);
        showSuccess("Plano atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/planos", dados);
        showSuccess("Plano criado com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalPlano - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{plano ? "Editar Plano" : "Criar Plano"}</h2>
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

