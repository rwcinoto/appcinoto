import React from "react";
import { useNavigate } from "react-router-dom";
import Loading from "../common/Loading";
import "./ListaConjuntos.css";

const ListaConjuntos = ({
  conjuntos,
  onEditar,
  onExcluir,
  onAdicionarElemento,
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
        <div className="sem-conjuntos-content">
          <h2>Você ainda não participa de nenhum conjunto</h2>
          <p>
            Os conjuntos permitem que você crie grupos com outros usuários e veja rankings específicos apenas dos elementos daquele conjunto.
          </p>
          <p>
            Para começar, crie um conjunto e adicione os e-mails dos usuários que você deseja convidar. Eles receberão um convite e, ao aceitarem, poderão participar do conjunto e visualizar o ranking apenas dos elementos do grupo.
          </p>
        </div>
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
                <span className="badge-elementos">
                  👥 {conjunto.quantidade_elementos} elemento
                  {conjunto.quantidade_elementos !== 1 ? "s" : ""}
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
                className="btn-adicionar-elemento-card"
                onClick={() => onAdicionarElemento(conjunto)}
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

