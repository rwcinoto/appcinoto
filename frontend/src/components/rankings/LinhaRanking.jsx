import { format } from "date-fns";
import React from "react";
import { useAuth } from "../../context/AuthContext";
import "./LinhaRanking.css";

const LinhaRanking = ({ item }) => {
  const { usuario } = useAuth();

  if (!item) {
    return null;
  }

  const { posicao, nome, total, data_recorde, id_usuario } = item;

  // Verificar se é o usuário logado
  const eUsuarioLogado = usuario && id_usuario === usuario.id;

  // Verificar se está no top 3
  const estaNoTop3 = posicao <= 3;

  // Obter cor baseada na posição
  const obterCorPosicao = () => {
    if (posicao === 1) return "#FFD700"; // Dourado
    if (posicao === 2) return "#C0C0C0"; // Prateado
    if (posicao === 3) return "#CD7F32"; // Bronze
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
          <span className="nome-usuario">{nome}</span>
          {eUsuarioLogado && (
            <span className="badge-usuario-logado">Você</span>
          )}
        </div>
      </td>
      <td className="coluna-pontuacao">
        <span className="pontuacao-valor">{total}</span>
      </td>
      <td className="coluna-data">
        <span className="data-recorde">{formatarData(data_recorde)}</span>
      </td>
    </tr>
  );
};

export default LinhaRanking;

