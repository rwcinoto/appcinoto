import React from "react";
import "./ListaSistemas.css";

const ListaSistemas = ({ sistemas, onEditar, onExcluir, formatarTipo }) => {
  if (sistemas.length === 0) {
    return <div className="sem-sistemas">Nenhum sistema encontrado</div>;
  }

  return (
    <div className="lista-sistemas">
      <table>
        <thead>
          <tr>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Plano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {sistemas.map((sistema) => (
            <tr key={sistema.id}>
              <td>
                <span className={`badge-tipo badge-${sistema.tipo}`}>
                  {formatarTipo(sistema.tipo)}
                </span>
              </td>
              <td>{sistema.descricao || "-"}</td>
              <td>{sistema.plano?.nome || "-"}</td>
              <td>
                <div className="acoes">
                  <button
                    className="btn-editar"
                    onClick={() => onEditar(sistema)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => onExcluir(sistema.id)}
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

export default ListaSistemas;
