import React from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading";
import "./DetalhesConjunto.css";

const DetalhesConjunto = ({
  conjunto,
  membros,
  meuTipo,
  onAdicionarMembro,
  loading = false,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <Loading text="Carregando detalhes do conjunto..." />;
  }

  if (!conjunto) {
    return (
      <div className="erro-container">
        <p>Conjunto não encontrado</p>
        <button onClick={() => navigate("/conjuntos")}>
          Voltar para conjuntos
        </button>
      </div>
    );
  }

  const podeGerenciar = meuTipo === "dono" || meuTipo === "admin";

  return (
    <div className="detalhes-conjunto">
      <div className="detalhes-header">
        <button className="btn-voltar" onClick={() => navigate("/conjuntos")}>
          ← Voltar
        </button>
        <div className="detalhes-info">
          <h1>{conjunto.nome}</h1>
          <div className="detalhes-meta">
            <span className="badge-membros">
              👥 {conjunto.membros?.length || 0} elemento
              {(conjunto.membros?.length || 0) !== 1 ? "s" : ""}
            </span>
            {meuTipo === "dono" && (
              <span className="badge-dono">Você é o dono</span>
            )}
            {meuTipo === "admin" && (
              <span className="badge-admin">Você é admin</span>
            )}
          </div>
        </div>
        {podeGerenciar && (
          <button className="btn-adicionar" onClick={onAdicionarMembro}>
            + Adicionar elemento
          </button>
        )}
      </div>
    </div>
  );
};

export default DetalhesConjunto;

