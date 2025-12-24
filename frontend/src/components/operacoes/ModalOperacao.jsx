import React, { useState } from "react";
import api from "../../services/api";
import FormOperacao from "./FormOperacao";
import "./ModalOperacao.css";

const ModalOperacao = ({ operacao, planos, onFechar, onSalvo }) => {
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSalvar = async (dados) => {
    setSalvando(true);
    setErro("");

    try {
      if (operacao) {
        // Atualizar
        await api.put(`/operacoes/${operacao.id}`, dados);
      } else {
        // Criar
        await api.post("/operacoes", dados);
      }
      onSalvo();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao salvar operação";
      setErro(mensagemErro);
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
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
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
