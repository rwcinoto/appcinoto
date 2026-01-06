import React from "react";
import "./ListaOperacoes.css";

const ListaOperacoes = ({ operacoes, onEditar, onExcluir }) => {
  if (operacoes.length === 0) {
    return <div className="sem-operacoes">Nenhuma operação encontrada</div>;
  }

  const getTipoLabel = (tipo) => {
    const tipos = {
      soma: "Soma",
      subtracao: "Subtração",
      multiplicacao: "Multiplicação",
      divisao: "Divisão",
      raiz: "Raiz quadrada",
      aleatorio: "Aleatório",
    };
    return tipos[tipo] || tipo;
  };

  const obterCorOperacao = (tipo) => {
    const cores = {
      soma: "#2196F3", // Azul
      subtracao: "#4CAF50", // Verde
      multiplicacao: "#FF9800", // Laranja
      divisao: "#FFD700", // Amarelo
      raiz: "#F44336", // Vermelho
      aleatorio: "#000000", // Preto
    };
    return cores[tipo] || "#E0E0E0";
  };

  return (
    <div className="lista-operacoes">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            <th>Descrição</th>
            <th>Plano</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {operacoes.map((operacao) => (
            <tr key={operacao.id}>
              <td>{operacao.nome}</td>
              <td>
                <span 
                  className="badge-tipo badge-tipo-operacao"
                  style={{
                    color: obterCorOperacao(operacao.tipo),
                  }}
                >
                  {getTipoLabel(operacao.tipo)}
                </span>
              </td>
              <td>{operacao.descricao || "-"}</td>
              <td>{operacao.plano?.nome || "-"}</td>
              <td>
                <div className="acoes">
                  <button
                    className="btn-editar"
                    onClick={() => onEditar(operacao)}
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn-excluir"
                    onClick={() => onExcluir(operacao.id)}
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

export default ListaOperacoes;
