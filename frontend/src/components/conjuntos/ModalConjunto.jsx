import React, { useState } from "react";
import api from "../../services/api";
import FormConjunto from "./FormConjunto";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalConjunto.css";

const ModalConjunto = ({ conjunto, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (conjunto) {
        // Atualizar
        await api.put(`/conjuntos/${conjunto.id}`, dados);
        showSuccess("Conjunto atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/conjuntos", dados);
        showSuccess("Conjunto criado com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalConjunto - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{conjunto ? "Editar conjunto" : "Criar conjunto"}</h2>
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

