import React from "react";
import "./ListaLimites.css";

const ListaLimites = ({ limites, onEditar, onExcluir }) => {
  if (limites.length === 0) {
    return <div className="sem-limites">Nenhum limite encontrado</div>;
  }

  const formatarTempo = (segundos) => {
    if (segundos < 60) {
      return `${segundos}s`;
    } else if (segundos < 3600) {
      const minutos = Math.floor(segundos / 60);
      const segundosRestantes = segundos % 60;
      return segundosRestantes > 0
        ? `${minutos}min ${segundosRestantes}s`
        : `${minutos}min`;
    } else {
      const horas = Math.floor(segundos / 3600);
      const minutos = Math.floor((segundos % 3600) / 60);
      const segundosRestantes = segundos % 60;
      let resultado = `${horas}h`;
      if (minutos > 0) resultado += ` ${minutos}min`;
      if (segundosRestantes > 0) resultado += ` ${segundosRestantes}s`;
      return resultado;
    }
  };

  return (
    <div className="lista-limites">
      <table>
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Tempo</th>
            <th>Plano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {limites.map((limite) => (
            <tr key={limite.id}>
              <td>{limite.descricao}</td>
              <td>{formatarTempo(limite.tempo)}</td>
              <td>{limite.plano?.nome || "-"}</td>
              <td>
                <div className="acoes">
                  <button
                    className="btn-editar"
                    onClick={() => onEditar(limite)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => onExcluir(limite.id)}
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

export default ListaLimites;
