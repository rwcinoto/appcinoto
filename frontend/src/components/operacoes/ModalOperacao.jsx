import React, { useState } from "react";
import api from "../../services/api";
import FormOperacao from "./FormOperacao";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalOperacao.css";

const ModalOperacao = ({ operacao, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (operacao) {
        // Atualizar
        await api.put(`/operacoes/${operacao.id}`, dados);
        showSuccess("Operação atualizada com sucesso!");
      } else {
        // Criar
        await api.post("/operacoes", dados);
        showSuccess("Operação criada com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalOperacao - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div
        className="modal-content modal-content-large"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{operacao ? "Editar Operação" : "Criar Operação"}</h2>
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
          <FormOperacao
            operacao={operacao}
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

export default ModalOperacao;
