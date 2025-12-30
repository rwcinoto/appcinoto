import React from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading";
import "./ListaConjuntos.css";

const ListaConjuntos = ({
  conjuntos,
  onEditar,
  onExcluir,
  onAdicionarMembro,
  onSair,
  loading = false,
}) => {
  const navigate = useNavigate();

  if (loading) {
    return <Loading text="Carregando conjuntos..." />;
  }

  if (conjuntos.length === 0) {
    return (
      <div className="sem-conjuntos">
        <p>Você ainda não participa de nenhum conjunto.</p>
        <p>Crie um conjunto para começar!</p>
      </div>
    );
  }

  return (
    <div className="lista-conjuntos">
      {conjuntos.map((conjunto) => (
        <div key={conjunto.id} className="conjunto-card">
          <div className="conjunto-header-card">
            <div className="conjunto-info">
              <h3>{conjunto.nome}</h3>
              <div className="conjunto-detalhes">
                <span className="badge-membros">
                  👥 {conjunto.quantidade_membros} elemento
                  {conjunto.quantidade_membros !== 1 ? "s" : ""}
                </span>
                {conjunto.tipo === "dono" && (
                  <span className="badge-dono">Dono</span>
                )}
                {conjunto.tipo === "admin" && (
                  <span className="badge-admin">Admin</span>
                )}
              </div>
            </div>
            {(conjunto.tipo === "dono" || conjunto.tipo === "admin") && (
              <button
                className="btn-adicionar-membro-card"
                onClick={() => onAdicionarMembro(conjunto)}
                title="Adicionar elemento"
              >
                + Elemento
              </button>
            )}
          </div>
          <div className="conjunto-acoes">
            <button
              className="btn-ver"
              onClick={() => navigate(`/conjuntos/${conjunto.id}`)}
              title="Ver detalhes"
            >
              Ver detalhes
            </button>
            {conjunto.tipo === "dono" && (
              <>
                <button
                  className="btn-editar"
                  onClick={() => onEditar(conjunto)}
                  title="Editar conjunto"
                >
                  Editar
                </button>
                <button
                  className="btn-excluir"
                  onClick={() => onExcluir(conjunto.id)}
                  title="Excluir conjunto"
                >
                  Excluir
                </button>
              </>
            )}
            {(conjunto.tipo === "admin" || conjunto.tipo === "comum") && (
              <button
                className="btn-sair"
                onClick={() => onSair(conjunto.id)}
                title="Sair do conjunto"
              >
                Sair
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ListaConjuntos;

