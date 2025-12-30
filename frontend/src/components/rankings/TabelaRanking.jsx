import React from "react";
import { useAuth } from "../../context/AuthContext";
import LinhaRanking from "./LinhaRanking";
import "./TabelaRanking.css";

const TabelaRanking = ({ ranking, posicaoUsuario }) => {
  const { usuario } = useAuth();
  if (!ranking || ranking.length === 0) {
    return (
      <div className="tabela-ranking sem-dados">
        <p>Nenhum registro encontrado no ranking.</p>
        <p className="subtitulo-vazio">
          Complete um treino para aparecer no ranking!
        </p>
      </div>
    );
  }

  return (
    <div className="tabela-ranking">
      <div className="tabela-ranking-container">
        <table className="tabela-ranking-table">
          <thead>
            <tr>
              <th className="coluna-posicao-header">Posição</th>
              <th className="coluna-nome-header">Nome</th>
              <th className="coluna-pontuacao-header">Pontuação</th>
              <th className="coluna-data-header">Data do recorde</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item) => (
              <LinhaRanking key={`${item.id_usuario}-${item.posicao}`} item={item} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Versão mobile (cards) */}
      <div className="tabela-ranking-mobile">
        {ranking.map((item) => {
          const eUsuarioLogado = usuario && item.id_usuario === usuario.id;
          return (
            <div key={`${item.id_usuario}-${item.posicao}`} className="card-ranking-mobile">
              <div className="card-ranking-header-mobile">
                <div className="card-ranking-posicao-mobile">
                  {item.posicao <= 3 && (
                    <span className="emoji-posicao-mobile">
                      {item.posicao === 1 ? "🥇" : item.posicao === 2 ? "🥈" : "🥉"}
                    </span>
                  )}
                  <span className="numero-posicao-mobile">#{item.posicao}</span>
                </div>
                <div className="card-ranking-pontuacao-mobile">{item.total}</div>
              </div>
              <div className="card-ranking-nome-data-mobile">
                <div className="card-ranking-nome-mobile">
                  <span>{item.nome}</span>
                  {eUsuarioLogado && (
                    <span className="badge-usuario-logado badge-usuario-logado-mobile">Você</span>
                  )}
                </div>
                <div className="card-ranking-data-mobile">
                  {new Date(item.data_recorde).toLocaleDateString("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TabelaRanking;

