import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import ModalEscolhaFormatoResposta from "../treino/ModalEscolhaFormatoResposta";
import "./CardUltimoRecordeBatido.css";

const formatarTipoSistema = (tipo) => {
  const tipos = {
    natural: "Natural",
    inteiro: "Inteiro",
    romano: "Romano",
    decimal: "Decimal",
    binario: "Binário",
    hexadecimal: "Hexadecimal",
  };
  return tipos[tipo] || tipo;
};

const obterCorOperacao = (tipo) => {
  const cores = {
    soma: "#2196f3",
    subtracao: "#4caf50",
    multiplicacao: "#ff9800",
    divisao: "#ffeb3b",
    raiz: "#f44336",
    conversao: "#BA68C8",
  };
  return cores[tipo] || "#666";
};

const obterCorSistema = (tipo, isDarkMode) => {
  if (isDarkMode) {
    const coresDark = {
      natural: { background: "rgba(33, 150, 243, 0.25)", color: "#64B5F6" },
      inteiro: { background: "rgba(0, 105, 92, 0.25)", color: "#4DB6AC" },
      romano: { background: "rgba(156, 39, 176, 0.25)", color: "#BA68C8" },
      decimal: { background: "rgba(198, 40, 40, 0.25)", color: "#EF5350" },
      binario: { background: "rgba(230, 81, 0, 0.25)", color: "#FFB74D" },
      hexadecimal: {
        background: "rgba(158, 158, 158, 0.25)",
        color: "#B0B0B0",
      },
    };
    return (
      coresDark[tipo] || {
        background: "rgba(158, 158, 158, 0.25)",
        color: "#B0B0B0",
      }
    );
  }
  const cores = {
    natural: { background: "#e3f2fd", color: "#1976d2" },
    inteiro: { background: "#e0f2f1", color: "#00695c" },
    romano: { background: "#f3e5f5", color: "#7b1fa2" },
    decimal: { background: "#ffebee", color: "#c62828" },
    binario: { background: "#fff3e0", color: "#e65100" },
    hexadecimal: { background: "#F5F5F5", color: "#000000" },
  };
  return cores[tipo] || { background: "#f5f5f5", color: "#666" };
};

const CardUltimoRecordeBatido = ({ recorde }) => {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [totalParticipantesRanking, setTotalParticipantesRanking] =
    useState(null);
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [mostrarModalFormato, setMostrarModalFormato] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [formatoResposta, setFormatoResposta] = useState(null);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (
        !recorde?.usuario?.id ||
        !recorde?.operacao ||
        !recorde?.limite ||
        !recorde?.sistema
      ) {
        return;
      }

      try {
        const params = new URLSearchParams({
          operacao_id: recorde.operacao.id.toString(),
          limite_id: recorde.limite.id.toString(),
          sistema_id: recorde.sistema.id.toString(),
          usuario_id: recorde.usuario.id.toString(),
        });
        const response = await api.get(
          `/rankings/posicao?${params.toString()}`,
        );
        setPosicaoRanking(response.data.posicao);
        setTotalParticipantesRanking(response.data.total_participantes ?? null);
      } catch (error) {
        console.error("Erro ao buscar posição no ranking:", error);
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde]);

  if (!recorde) return null;

  const tipoOperacao = recorde.operacao?.tipo || "";
  const corOperacao = obterCorOperacao(tipoOperacao);
  const tipoSistema = recorde.sistema?.tipo || "";
  const coresSistema = obterCorSistema(tipoSistema, isDarkMode);

  const handleIniciarTreino = async () => {
    if (!recorde?.operacao || !recorde?.limite || !recorde?.sistema) {
      return;
    }

    setIniciandoTreino(true);

    try {
      const response = await api.post("/treinos/iniciar", {
        operacao_id: recorde.operacao.id,
        limite_id: recorde.limite.id,
        sistema_id: recorde.sistema.id,
      });

      setDadosTreino(response.data);

      if (
        tipoSistema === "romano" ||
        tipoSistema === "hexadecimal" ||
        tipoSistema === "binario"
      ) {
        setMostrarModalFormato(true);
      } else {
        setFormatoResposta("sistema");
        setMostrarContagem(true);
      }
    } catch (error) {
      logError("CardUltimoRecordeBatido - handleIniciarTreino", error);
      alert(getErrorMessage(error));
      setIniciandoTreino(false);
    }
  };

  const handleEscolherFormato = (formato) => {
    setFormatoResposta(formato);
    setMostrarModalFormato(false);
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
    navigate("/treino-ativo", {
      state: {
        treinoData: dadosTreino,
        formatoResposta: formatoResposta || "sistema",
        sistemaTipo: tipoSistema || "natural",
      },
    });
  };

  return (
    <>
      {mostrarModalFormato &&
        (tipoSistema === "romano" ||
          tipoSistema === "hexadecimal" ||
          tipoSistema === "binario") && (
          <ModalEscolhaFormatoResposta
            sistemaTipo={tipoSistema}
            onEscolher={handleEscolherFormato}
            onCancelar={handleCancelarFormato}
          />
        )}
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div
        className="card-ultimo-recorde-batido"
        style={{ borderColor: corOperacao }}
      >
        <div className="card-ultimo-recorde-batido-header">
          <span
            className="card-ultimo-recorde-batido-operacao"
            style={{ color: corOperacao }}
          >
            {recorde.operacao?.nome || "-"}
          </span>
          <button
            className="card-ultimo-recorde-batido-botao-treino"
            onClick={handleIniciarTreino}
            disabled={iniciandoTreino}
            title="Treinar com estas configurações"
            aria-label="Treinar com estas configurações"
            style={{ borderColor: corOperacao }}
          >
            {iniciandoTreino ? "..." : "🏃 Treinar"}
          </button>
        </div>

        <div className="card-ultimo-recorde-batido-usuario">
          <Link
            to={`/recordes?usuario_id=${recorde.usuario?.id || ""}`}
            className="card-ultimo-recorde-batido-link-usuario"
          >
            {recorde.usuario?.nome || "-"}
          </Link>
        </div>

        <div className="card-ultimo-recorde-batido-linha">
          <span className="card-ultimo-recorde-batido-limite">
            {recorde.limite?.descricao || "-"}
          </span>
          <span className="card-ultimo-recorde-batido-separador">•</span>
          <span
            className="card-ultimo-recorde-batido-sistema-badge"
            style={{
              backgroundColor: coresSistema.background,
              color: coresSistema.color,
            }}
          >
            {recorde.sistema?.tipo
              ? formatarTipoSistema(recorde.sistema.tipo)
              : "-"}
          </span>
          <span className="card-ultimo-recorde-batido-separador">•</span>
          <span
            className="card-ultimo-recorde-batido-total"
            style={{ color: corOperacao }}
          >
            {recorde.total ?? 0} acertos
          </span>
        </div>

        {posicaoRanking !== null &&
          recorde.operacao &&
          recorde.limite &&
          recorde.sistema && (
            <div className="card-ultimo-recorde-batido-posicao">
              <span className="card-ultimo-recorde-batido-posicao-label">
                Posição:
              </span>
              <Link
                to={`/rankings?operacao_id=${recorde.operacao.id}&limite_id=${recorde.limite.id}&sistema_id=${recorde.sistema.id}`}
                className="card-ultimo-recorde-batido-posicao-link"
              >
                #{posicaoRanking}
              </Link>
              <span className="card-ultimo-recorde-batido-posicao-label">
                {totalParticipantesRanking != null &&
                  ` de ${totalParticipantesRanking}`}
              </span>
            </div>
          )}
      </div>
    </>
  );
};

export default CardUltimoRecordeBatido;
