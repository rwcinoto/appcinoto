import React from "react";
import { useNavigate } from "react-router-dom";
import { formatarTempoSenha } from "../../constants/senha";
import "./InfoUsuario.css";

const InfoUsuarioSenha = ({
  posicaoUsuario,
  totalParticipantes,
  ranking,
  isVisitante = false,
  digitos,
  tamanho,
  repeticao,
}) => {
  const navigate = useNavigate();

  const handleIniciarTreino = () => {
    navigate("/treino-senha", {
      state: {
        digitos,
        tamanho,
        repeticao,
      },
    });
  };

  const usuarioNoRanking = ranking?.find(
    (item) => item.posicao === posicaoUsuario
  );
  const pontuacao = usuarioNoRanking?.total || 0;
  const tempoRecorde = usuarioNoRanking?.tempo;

  const estaNoTop3 = posicaoUsuario && posicaoUsuario <= 3;
  const obterCorPosicao = () => {
    if (posicaoUsuario === 1) return "#FFD700";
    if (posicaoUsuario === 2) return "#C0C0C0";
    if (posicaoUsuario === 3) return "#CD7F32";
    return "#2196f3";
  };
  const obterEmojiPosicao = () => {
    if (posicaoUsuario === 1) return "🥇";
    if (posicaoUsuario === 2) return "🥈";
    if (posicaoUsuario === 3) return "🥉";
    return null;
  };

  const corPosicao = obterCorPosicao();
  const emojiPosicao = obterEmojiPosicao();

  if (posicaoUsuario === null || posicaoUsuario === undefined) {
    return (
      <div className="info-usuario sem-recorde">
        <div className="info-usuario-mensagem">
          <p>
            Você ainda não tem recorde neste ranking (ou desabilitou no perfil
            para aparecer no ranking global).
          </p>
          <p className="info-usuario-subtitulo">
            {isVisitante
              ? "Visitantes não aparecem no ranking. Faça login para participar e aparecer no ranking!"
              : "Complete um treino para aparecer no ranking!"}
          </p>
          <div className="info-usuario-botao-container">
            <button
              className="info-usuario-botao-treino"
              onClick={handleIniciarTreino}
              title="Iniciar treino com estas configurações"
              aria-label="Iniciar treino com estas configurações"
            >
              🏃 Iniciar este treino
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <span className="info-usuario-label">Suas tentativas</span>
          <span className="info-usuario-valor pontuacao">
            {pontuacao}
            {tempoRecorde != null && (
              <span className="info-usuario-tempo-detalhe" style={{ fontSize: "0.65em", color: "#888", marginLeft: "6px" }}>
                ({formatarTempoSenha(tempoRecorde)})
              </span>
            )}
          </span>
        </div>
        <div className="info-usuario-coluna info-usuario-posicao">
          <span className="info-usuario-label">Posição</span>
          <div
            className="info-usuario-valor posicao"
            style={estaNoTop3 ? { color: corPosicao } : {}}
          >
            {emojiPosicao && (
              <span className="emoji-posicao">{emojiPosicao}</span>
            )}
            <span className="numero-posicao">#{posicaoUsuario}</span>
            {totalParticipantes > 0 && (
              <span className="total-participantes">
                {" "}
                de {totalParticipantes} participantes
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
        <div className="info-usuario-coluna info-usuario-botao">
          <button
            className="info-usuario-botao-treino"
            onClick={handleIniciarTreino}
            title="Iniciar treino com estas configurações"
            aria-label="Iniciar treino com estas configurações"
          >
            🏃 Iniciar este treino
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoUsuarioSenha;
