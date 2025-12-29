import React, { useState } from "react";
import api from "../../services/api";
import "./ModalAdicionarMembro.css";

const ModalAdicionarMembro = ({ conjuntoId, onFechar, onMembroAdicionado }) => {
  const [email, setEmail] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErro("");
    setSalvando(true);

    if (!email.trim()) {
      setErro("Email é obrigatório");
      setSalvando(false);
      return;
    }

    try {
      await api.post(`/conjuntos/${conjuntoId}/usuarios`, {
        email: email.trim(),
      });
      onMembroAdicionado();
      onFechar();
    } catch (error) {
      const mensagemErro =
        error.response?.data?.message ||
        error.response?.data?.errors?.[0]?.msg ||
        "Erro ao convidar usuário";
      setErro(mensagemErro);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onFechar}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adicionar membro</h2>
          <button className="modal-close" onClick={onFechar}>
            ×
          </button>
        </div>
        <div className="modal-body">
          {erro && <div className="erro-modal">{erro}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email do usuário *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Digite o email do usuário"
                disabled={salvando}
                required
              />
              <small>O usuário receberá um convite para participar do conjunto</small>
            </div>
            <div className="form-actions">
              <button type="button" onClick={onFechar} disabled={salvando}>
                Cancelar
              </button>
              <button type="submit" disabled={salvando}>
                {salvando ? "Enviando..." : "Convidar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ModalAdicionarMembro;

