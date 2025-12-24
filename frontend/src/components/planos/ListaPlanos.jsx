import React from "react";
import "./ListaPlanos.css";

const ListaPlanos = ({ planos, onEditar, onExcluir }) => {
  if (planos.length === 0) {
    return <div className="sem-planos">Nenhum plano encontrado</div>;
  }

  return (
    <div className="lista-planos">
      <table>
        <thead>
          <tr>
            <th>Ordem</th>
            <th>Nome</th>
            <th>Descrição</th>
            <th>Criar Conjuntos</th>
            <th>Participar Conjuntos</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {planos.map((plano) => (
            <tr key={plano.id}>
              <td>{plano.ordem}</td>
              <td>{plano.nome}</td>
              <td>{plano.descricao || "-"}</td>
              <td>{plano.conjuntos_criar}</td>
              <td>{plano.conjuntos_participar}</td>
              <td>
                <div className="acoes">
                  <button
                    className="btn-editar"
                    onClick={() => onEditar(plano)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => onExcluir(plano.id)}
                    title="Excluir"
                  >
                    🗑️
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ListaPlanos;
