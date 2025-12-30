import React from "react";
import "./InfoUsuario.css";

const InfoUsuario = ({ posicaoUsuario, totalParticipantes, ranking }) => {
  // Encontrar dados do usuário no ranking (se estiver no top 100)
  const usuarioNoRanking = ranking?.find(
    (item) => item.posicao === posicaoUsuario
  );

  // Verificar se está no top 3
  const estaNoTop3 = posicaoUsuario && posicaoUsuario <= 3;

  // Se não tem posição, significa que não tem recorde
  if (posicaoUsuario === null || posicaoUsuario === undefined) {
    return (
      <div className="info-usuario sem-recorde">
        <div className="info-usuario-mensagem">
          <p>Você ainda não tem recorde neste ranking.</p>
          <p className="info-usuario-subtitulo">
            Complete um treino para aparecer no ranking!
          </p>
        </div>
      </div>
    );
  }

  // Obter pontuação (do ranking ou calcular)
  const pontuacao = usuarioNoRanking?.total || 0;

  // Obter cor baseada na posição
  const obterCorPosicao = () => {
    if (posicaoUsuario === 1) return "#FFD700"; // Dourado
    if (posicaoUsuario === 2) return "#C0C0C0"; // Prateado
    if (posicaoUsuario === 3) return "#CD7F32"; // Bronze
    return "#2196f3"; // Azul padrão
  };

  const corPosicao = obterCorPosicao();

  // Obter emoji/ícone da posição
  const obterEmojiPosicao = () => {
    if (posicaoUsuario === 1) return "🥇";
    if (posicaoUsuario === 2) return "🥈";
    if (posicaoUsuario === 3) return "🥉";
    return null;
  };

  const emojiPosicao = obterEmojiPosicao();

  return (
    <div
      className={`info-usuario ${estaNoTop3 ? "top-3" : ""}`}
      style={
        estaNoTop3
          ? {
              borderColor: corPosicao,
              background: `linear-gradient(135deg, ${corPosicao}15 0%, ${corPosicao}05 100%)`,
            }
          : {}
      }
    >
      <div className="info-usuario-conteudo">
        <div className="info-usuario-coluna info-usuario-pontuacao">
          <span className="info-usuario-label">Sua pontuação</span>
          <span className="info-usuario-valor pontuacao">{pontuacao}</span>
        </div>
        <div className="info-usuario-coluna info-usuario-posicao">
          <span className="info-usuario-label">Posição</span>
          <div
            className="info-usuario-valor posicao"
            style={estaNoTop3 ? { color: corPosicao } : {}}
          >
            {emojiPosicao && <span className="emoji-posicao">{emojiPosicao}</span>}
            <span className="numero-posicao">#{posicaoUsuario}</span>
            {totalParticipantes > 0 && (
              <span className="total-participantes">
                {" "}de {totalParticipantes} participantes
              </span>
            )}
          </div>
        </div>
        {estaNoTop3 && (
          <div className="info-usuario-coluna info-usuario-parabens">
            <span className="info-usuario-parabens-texto">
              Parabéns! Você está entre os 3 primeiros! 🎉
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfoUsuario;

