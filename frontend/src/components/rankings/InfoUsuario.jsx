import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import ModalEscolhaFormatoResposta from "../treino/ModalEscolhaFormatoResposta";
import "./InfoUsuario.css";

const InfoUsuario = ({
  posicaoUsuario,
  totalParticipantes,
  ranking,
  isVisitante = false,
  operacaoId,
  limiteId,
  sistemaId,
  sistemaTipo
}) => {
  const navigate = useNavigate();
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [formatoResposta, setFormatoResposta] = useState(null);

  const handleIniciarTreino = async () => {
    if (!operacaoId || !limiteId || !sistemaId) {
      return;
    }

    setIniciandoTreino(true);

    try {
      const response = await api.post("/treinos/iniciar", {
        operacao_id: operacaoId,
        limite_id: limiteId,
        sistema_id: sistemaId,
      });

      // Salvar dados do treino
      setDadosTreino(response.data);

      // Verificar se o sistema é romano, hexadecimal ou binário para mostrar modal de escolha
      if (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") {
        // Mostrar modal de escolha de formato
        setMostrarModalFormato(true);
      } else {
        // Sistema não requer escolha, ir direto para contagem
        setFormatoResposta("sistema"); // Padrão: usar o sistema escolhido
        // confirmar-inicio será chamado em TreinoAtivo quando a contagem terminar
        setMostrarContagem(true);
      }
    } catch (error) {
      logError("InfoUsuario - handleIniciarTreino", error);
      alert(getErrorMessage(error));
      setIniciandoTreino(false);
    }
  };

  const handleEscolherFormato = async (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
    // confirmar-inicio será chamado em TreinoAtivo quando a contagem terminar
    setMostrarContagem(true);
  };

  const handleCancelarFormato = () => {
    setMostrarModalFormato(false);
    setIniciandoTreino(false);
    setDadosTreino(null);
    setFormatoResposta(null);
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciandoTreino(false);
    // Navegar para tela de treino ativo com dados do treino e formato escolhido
    navigate("/treino-ativo", {
      state: {
        treinoData: dadosTreino,
        formatoResposta: formatoResposta || "sistema", // Padrão se não escolhido
        sistemaTipo: sistemaTipo || "natural"
      }
    });
  };

  // Encontrar dados do usuário no ranking (se estiver no top 100)
  const usuarioNoRanking = ranking?.find(
    (item) => item.posicao === posicaoUsuario
  );

  // Verificar se está no top 3
  const estaNoTop3 = posicaoUsuario && posicaoUsuario <= 3;

  // Se não tem posição, significa que não tem recorde
  if (posicaoUsuario === null || posicaoUsuario === undefined) {
    return (
      <>
        {mostrarModalFormato && (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") && (
          <ModalEscolhaFormatoResposta
            sistemaTipo={sistemaTipo}
            onEscolher={handleEscolherFormato}
            onCancelar={handleCancelarFormato}
          />
        )}
        {mostrarContagem && (
          <ContagemRegressiva onTerminar={handleContagemTerminar} />
        )}
        <div className="info-usuario sem-recorde">
          <div className="info-usuario-mensagem">
            <p>Você ainda não tem recorde neste ranking (ou deabilitou no perfil para aparecer no ranking global).</p>
            <p className="info-usuario-subtitulo">
              {isVisitante
                ? "Visitantes não aparecem no ranking. Faça login para participar e aparecer no ranking!"
                : "Complete um treino para aparecer no ranking!"
              }
            </p>
            {!isVisitante && operacaoId && limiteId && sistemaId && (
              <div className="info-usuario-botao-container">
                <button
                  className="info-usuario-botao-treino"
                  onClick={handleIniciarTreino}
                  disabled={iniciandoTreino}
                  title="Iniciar treino com estas configurações"
                  aria-label="Iniciar treino com estas configurações"
                >
                  {iniciandoTreino ? "..." : "🏃 Iniciar esse treino"}
                </button>
              </div>
            )}
          </div>
        </div>
      </>
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
    <>
      {mostrarModalFormato && (sistemaTipo === "romano" || sistemaTipo === "hexadecimal" || sistemaTipo === "binario") && (
        <ModalEscolhaFormatoResposta
          sistemaTipo={sistemaTipo}
          onEscolher={handleEscolherFormato}
          onCancelar={handleCancelarFormato}
        />
      )}
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
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
        {operacaoId && limiteId && sistemaId && (
          <div className="info-usuario-coluna info-usuario-botao">
            <button
              className="info-usuario-botao-treino"
              onClick={handleIniciarTreino}
              disabled={iniciandoTreino}
              title="Iniciar treino com estas configurações"
              aria-label="Iniciar treino com estas configurações"
            >
              {iniciandoTreino ? "..." : "🏃"}
            </button>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default InfoUsuario;

