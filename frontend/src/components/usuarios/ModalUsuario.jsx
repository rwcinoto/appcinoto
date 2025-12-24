import React, { useState } from "react";
import api from "../../services/api";
import FormUsuario from "./FormUsuario";
import "./ModalUsuario.css";

const ModalUsuario = ({ usuario, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (usuario) {
        // Atualizar
        await api.put(`/usuarios/${usuario.id}`, dados);
      } else {
        // Criar
        await api.post("/usuarios", dados);
      }
      onSalvo();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao salvar usuário";
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{usuario ? "Editar Usuário" : "Criar Usuário"}</h2>
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
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
