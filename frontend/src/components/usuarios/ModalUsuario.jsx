import React, { useState } from "react";
import api from "../../services/api";
import FormUsuario from "./FormUsuario";
import ErrorMessage from "../common/ErrorMessage";
import { useToast } from "../../context/ToastContext";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import "./ModalUsuario.css";

const ModalUsuario = ({ usuario, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const { showSuccess } = useToast();

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (usuario) {
        // Atualizar
        await api.put(`/usuarios/${usuario.id}`, dados);
        showSuccess("Usuário atualizado com sucesso!");
      } else {
        // Criar
        await api.post("/usuarios", dados);
        showSuccess("Usuário criado com sucesso!");
      }
      onSalvo();
    } catch (error) {
      logError("ModalUsuario - handleSalvar", error);
      setErro(getErrorMessage(error));
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{usuario ? "Editar Usuário" : "Criar Usuário"}</h2>
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
          {salvando && <div className="salvando">Salvando...</div>}
          <FormUsuario
            usuario={usuario}
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

export default ModalUsuario;
