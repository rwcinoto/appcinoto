import { format } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./LinhaRanking.css";

const LinhaRanking = ({ item, tempoLimite }) => {
  const { usuario } = useAuth();

  if (!item) {
    return null;
  }

  const { posicao, nome, total, quantidade, data_recorde, id_usuario } = item;

  // Calcular tempo médio por conta
  const calcularTempoMedioPorConta = () => {
    const totalAcertos = total || 0;
    const tempo = tempoLimite || 0;

    if (totalAcertos === 0 || tempo === 0) {
      return null;
    }

    const tempoMedio = tempo / totalAcertos;
    return tempoMedio.toFixed(1).replace(".", ",");
  };

  const tempoMedioFormatado = calcularTempoMedioPorConta();

  // Verificar se é o usuário logado
  const eUsuarioLogado = usuario && id_usuario === usuario.id;

  // Verificar se está no top 3
  const estaNoTop3 = posicao <= 3;

  // Obter cor baseada na posição (tema do cubo mágico)
  const obterCorPosicao = () => {
    if (posicao === 1) return "#FFD700"; // Amarelo/Dourado
    if (posicao === 2) return "#C0C0C0"; // Prateado/Cinza
    if (posicao === 3) return "#FF9800"; // Laranja/Bronze
    return null;
  };

  const corPosicao = obterCorPosicao();

  // Obter emoji/ícone da posição
  const obterEmojiPosicao = () => {
    if (posicao === 1) return "🥇";
    if (posicao === 2) return "🥈";
    if (posicao === 3) return "🥉";
    return null;
  };

  const emojiPosicao = obterEmojiPosicao();

  // Formatar data
  const formatarData = (data) => {
    if (!data) return "-";
    try {
      const dataObj = new Date(data);
      return format(dataObj, "dd/MM/yy");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  };

  // Classes CSS baseadas no estado
  const classesLinha = [
    "linha-ranking",
    estaNoTop3 ? "top-3" : "",
    posicao === 1 ? "top-1" : "",
    posicao === 2 ? "top-2" : "",
    posicao === 3 ? "top-3-pos" : "",
    eUsuarioLogado ? "usuario-logado" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <tr className={classesLinha}>
      <td className="coluna-posicao">
        <div
          className="posicao-container"
          style={estaNoTop3 ? { color: corPosicao } : {}}
        >
          {emojiPosicao && <span className="emoji-posicao">{emojiPosicao}</span>}
          <span className="numero-posicao">#{posicao}</span>
        </div>
      </td>
      <td className="coluna-nome">
        <div className="nome-container">
          {eUsuarioLogado ? (
            <Link 
              to="/recordes"
              className="nome-usuario-link"
            >
              {nome}
            </Link>
          ) : (
            <Link 
              to={`/recordes?usuario_id=${id_usuario}`}
              className="nome-usuario-link"
            >
              {nome}
            </Link>
          )}
          {eUsuarioLogado && (
            <span className="badge-usuario-logado">Você</span>
          )}
        </div>
      </td>
      <td className="coluna-pontuacao">
        <span 
          className="pontuacao-valor"
          style={estaNoTop3 ? { color: corPosicao } : {}}
        >
          {total}
          {tempoMedioFormatado && (
            <span className="pontuacao-tempo-medio">
              {" "}({tempoMedioFormatado} seg/conta)
            </span>
          )}
        </span>
      </td>
      <td className="coluna-data">
        <span 
          className="data-recorde"
          style={eUsuarioLogado ? { fontWeight: 'bold' } : {}}
        >
          {formatarData(data_recorde)}
        </span>
      </td>
      <td className="coluna-tentativas">
        <span 
          className="tentativas-valor"
          style={eUsuarioLogado ? { fontWeight: 'bold' } : {}}
        >
          {quantidade || 0}
        </span>
      </td>
    </tr>
  );
};

export default LinhaRanking;

