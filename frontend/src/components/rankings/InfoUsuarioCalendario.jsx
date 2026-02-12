import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ModalOpcoesCalendario from "../treino/ModalOpcoesCalendario";
import "./InfoUsuario.css";

const InfoUsuarioCalendario = ({
  posicaoUsuario,
  totalParticipantes,
  ranking,
  isVisitante = false,
  tipo,
  limiteId,
}) => {
  const navigate = useNavigate();
  const [mostrarModalOpcoes, setMostrarModalOpcoes] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia) {
      const mq = window.matchMedia("(max-width: 768px)");
      const atualizar = () => setIsMobile(mq.matches);
      atualizar();
      mq.addEventListener("change", atualizar);
      return () => mq.removeEventListener("change", atualizar);
    }
  }, []);

  const handleIniciarTreino = () => {
    if (!tipo || !limiteId) {
      return;
    }
    setMostrarModalOpcoes(true);
  };

  const handleConfirmarOpcoes = (opcoes) => {
    setMostrarModalOpcoes(false);
    const tipoResposta =
      opcoes?.resposta === "nomeDia" ? "texto" : "numeros";
    // Navega para TreinoAtivo com a seleção; o treino será criado e a contagem exibida lá
    navigate("/treino-ativo", {
      state: {
        modo: "calendario",
        tipo,
        limiteId,
        visualizacao: opcoes?.visualizacao || "texto",
        tipoResposta: opcoes?.resposta != null ? tipoResposta : "numeros",
        chaveSeculo21Base:
          tipo === "seculo" && opcoes?.chaveSeculo21 != null
            ? Number(opcoes.chaveSeculo21)
            : undefined,
        chaveJaneiroBase:
          tipo === "mes" && opcoes?.chaveJaneiro != null
            ? Number(opcoes.chaveJaneiro)
            : undefined,
      },
    });
  };

  const handleCancelarOpcoes = () => {
    setMostrarModalOpcoes(false);
  };

  const usuarioNoRanking = ranking?.find(
    (item) => item.posicao === posicaoUsuario,
  );
  const pontuacao = usuarioNoRanking?.total || 0;

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

  const mostrarOpcoesResposta =
    isMobile &&
    (tipo === "data_geral" || tipo === "data_21" || tipo === "data_esse_ano");

  if (posicaoUsuario === null || posicaoUsuario === undefined) {
    return (
      <>
        <ModalOpcoesCalendario
          mostrar={mostrarModalOpcoes}
          mostrarOpcoesResposta={mostrarOpcoesResposta}
          onConfirmar={handleConfirmarOpcoes}
          onCancelar={handleCancelarOpcoes}
          mostrarChaveSeculo21={tipo === "seculo"}
          chaveSeculo21Inicial={0}
          mostrarChaveJaneiro={tipo === "mes"}
          chaveJaneiroInicial={0}
        />
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
            {tipo && limiteId && (
              <div className="info-usuario-botao-container">
                <button
                  className="info-usuario-botao-treino"
                  onClick={handleIniciarTreino}
                  title="Iniciar treino com estas configurações"
                  aria-label="Iniciar treino com estas configurações"
                >
                  🏃 Iniciar esse treino
                </button>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <ModalOpcoesCalendario
        mostrar={mostrarModalOpcoes}
        mostrarOpcoesResposta={mostrarOpcoesResposta}
        onConfirmar={handleConfirmarOpcoes}
        onCancelar={handleCancelarOpcoes}
        mostrarChaveSeculo21={tipo === "seculo"}
        chaveSeculo21Inicial={0}
        mostrarChaveJaneiro={tipo === "mes"}
        chaveJaneiroInicial={0}
      />
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
          {tipo && limiteId && (
            <div className="info-usuario-coluna info-usuario-botao">
              <button
                className="info-usuario-botao-treino"
                onClick={handleIniciarTreino}
                title="Iniciar treino com estas configurações"
                aria-label="Iniciar treino com estas configurações"
              >
                🏃
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default InfoUsuarioCalendario;
