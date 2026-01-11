import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import LinhaRanking from "./LinhaRanking";
import "./TabelaRanking.css";

const TabelaRanking = ({ ranking, posicaoUsuario, tempoLimite }) => {
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
              <th className="coluna-data-header">Data</th>
              <th className="coluna-tentativas-header">Treinos</th>
            </tr>
          </thead>
          <tbody>
            {ranking.map((item) => (
              <LinhaRanking 
                key={`${item.id_usuario}-${item.posicao}`} 
                item={item}
                tempoLimite={tempoLimite}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Versão mobile (cards) */}
      <div className="tabela-ranking-mobile">
        {ranking.map((item) => {
          const eUsuarioLogado = usuario && item.id_usuario === usuario.id;
          
          // Calcular tempo médio por conta
          const calcularTempoMedioPorConta = () => {
            const totalAcertos = item.total || 0;
            const tempo = tempoLimite || 0;

            if (totalAcertos === 0 || tempo === 0) {
              return null;
            }

            const tempoMedio = tempo / totalAcertos;
            return tempoMedio.toFixed(1).replace(".", ",");
          };

          const tempoMedioFormatado = calcularTempoMedioPorConta();
          
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
                <div className="card-ranking-pontuacao-mobile">
                  {item.total}
                  {tempoMedioFormatado && (
                    <span className="card-ranking-tempo-medio-mobile">
                      {" "}({tempoMedioFormatado} seg/conta)
                    </span>
                  )}
                </div>
              </div>
              <div className="card-ranking-nome-data-mobile">
                <div className="card-ranking-nome-mobile">
                  {eUsuarioLogado ? (
                    <Link 
                      to="/recordes"
                      className="nome-usuario-link-mobile"
                    >
                      {item.nome}
                    </Link>
                  ) : (
                    <Link 
                      to={`/recordes?usuario_id=${item.id_usuario}`}
                      className="nome-usuario-link-mobile"
                    >
                      {item.nome}
                    </Link>
                  )}
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
                <div className="card-ranking-tentativas-mobile">
                  {item.quantidade || 0} {item.quantidade === 1 ? "treino" : "treinos"}
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

