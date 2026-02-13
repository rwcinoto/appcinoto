import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import "./CardRecorde.css";

const TIPOS_CALENDARIO_LABEL = {
  data_geral: "Data 1582-2399",
  dia: "Dia",
  mes: "Mês",
  ano: "Ano",
  seculo: "Século",
  data_esse_ano: "Data esse ano",
  data_21: "Data século XXI",
};

const obterCorPorTipoCalendario = (tipo) => {
  const cores = {
    data_geral: "#2196f3",
    dia: "#00bcd4",
    mes: "#4caf50",
    ano: "#ff9800",
    seculo: "#9c27b0",
    data_esse_ano: "#e91e63",
    data_21: "#f44336",
  };
  return cores[tipo] || "#666";
};

const obterUnidadePorTipoCalendario = (tipo) => {
  if (tipo === "data_geral" || tipo === "data_21" || tipo === "data_esse_ano")
    return "data";
  if (tipo === "dia") return "dia";
  if (tipo === "mes") return "mês";
  if (tipo === "ano") return "ano";
  if (tipo === "seculo") return "século";
  return "data";
};

const CardRecordeCalendario = ({ recorde, usuarioIdVisualizado = null }) => {
  const navigate = useNavigate();
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [posicaoRanking, setPosicaoRanking] = useState(null);

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

  const corTipo = recorde ? obterCorPorTipoCalendario(recorde.tipo) : "#666";

  const calcularTempoMedioPorData = () => {
    if (!recorde) return null;
    const totalAcertos = recorde.total || 0;
    const tempoLimite = recorde.limite?.tempo || 0;

    if (totalAcertos === 0 || tempoLimite === 0) {
      return null;
    }

    return tempoLimite / totalAcertos;
  };

  const tempoMedioPorData = calcularTempoMedioPorData();
  const tempoMedioFormatado =
    tempoMedioPorData !== null
      ? tempoMedioPorData.toFixed(1).replace(".", ",")
      : null;
  const unidadeTempoMedio = obterUnidadePorTipoCalendario(
    recorde ? recorde.tipo : "",
  );

  const handleIniciarTreino = async () => {
    if (!recorde?.tipo || !recorde?.limite) {
      return;
    }

    setIniciandoTreino(true);

    try {
      const response = await api.post("/calendario/treinos/iniciar", {
        tipo: recorde.tipo,
        limite_id: recorde.limite.id,
      });

      setDadosTreino(response.data);
      // confirmar-inicio será chamado em TreinoAtivo quando a contagem terminar
      setMostrarContagem(true);
    } catch (error) {
      logError("CardRecordeCalendario - handleIniciarTreino", error);
      alert(getErrorMessage(error));
      setIniciandoTreino(false);
    }
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciandoTreino(false);
    navigate("/treino-ativo", {
      state: {
        modo: "calendario",
        treinoData: dadosTreino,
      },
    });
  };

  const labelTipo = recorde
    ? TIPOS_CALENDARIO_LABEL[recorde.tipo] || recorde.tipo
    : "";
  const dataRecordeFormatada = recorde
    ? formatarData(recorde.data_recorde || recorde.atualizado_em)
    : "-";

  const linkRanking =
    recorde && recorde.limite
      ? `/calendario?tipo=${encodeURIComponent(
          recorde.tipo,
        )}&limite_id=${recorde.limite.id}`
      : "/calendario";

  const usuarioRankingId =
    usuarioIdVisualizado || (recorde ? recorde.id_usuario : null);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde?.tipo || !recorde?.limite?.id || !usuarioRankingId) {
        setPosicaoRanking(null);
        return;
      }

      try {
        const params = new URLSearchParams({
          tipo: recorde.tipo,
          limite_id: recorde.limite.id.toString(),
        });

        const response = await api.get(
          `/calendario/rankings?${params.toString()}`,
        );

        const ranking = response.data?.ranking || [];
        const itemUsuario = ranking.find(
          (item) => item.id_usuario === usuarioRankingId,
        );

        setPosicaoRanking(itemUsuario ? itemUsuario.posicao : null);
      } catch (error) {
        console.error(
          "Erro ao buscar posição no ranking de calendário:",
          error,
        );
        setPosicaoRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde, usuarioRankingId]);

  if (!recorde) {
    return null;
  }

  return (
    <>
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div
        className="card-recorde"
        style={{ borderColor: corTipo, "--cor-operacao": corTipo }}
      >
        <div className="card-recorde-header">
          <div className="card-recorde-titulo-linha">
            <button
              className="card-recorde-botao-treino"
              onClick={handleIniciarTreino}
              disabled={iniciandoTreino}
              title="Iniciar treino de calendário com esta configuração"
              aria-label="Iniciar treino de calendário com esta configuração"
            >
              {iniciandoTreino ? "..." : "🏃 Treinar"}
            </button>
            <h3>{labelTipo}</h3>
          </div>
          <div className="card-recorde-acertos-linha">
            <span className="card-recorde-acertos-texto">
              <strong>Acertos:</strong>{" "}
              <span
                className="card-recorde-acertos-valor"
                style={{ color: corTipo }}
              >
                {recorde.total || 0}
              </span>
              {tempoMedioFormatado && (
                <span className="card-recorde-tempo-medio">
                  {" "}
                  ({tempoMedioFormatado} seg/{unidadeTempoMedio})
                </span>
              )}
            </span>
          </div>
        </div>

        <div className="card-recorde-info-linha">
          <div className="card-recorde-info-item">
            <span className="card-recorde-info-label">Limite</span>
            <span className="card-recorde-info-value">
              {recorde.limite?.descricao || "-"}
            </span>
          </div>

          <div className="card-recorde-info-item">
            <span className="card-recorde-info-label">Data</span>
            <span className="card-recorde-info-value">
              {dataRecordeFormatada}
            </span>
          </div>
        </div>

        <div className="card-recorde-posicao-ranking">
          <span className="card-recorde-tentativas-texto">
            Treinos: {recorde.quantidade || 0}
          </span>
          {posicaoRanking !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="card-recorde-posicao-label">
                Posição global:
              </span>
              <Link
                to={linkRanking}
                className="card-recorde-posicao-valor card-recorde-posicao-link"
                title="Ver ranking deste tipo de treino de calendário"
              >
                #{posicaoRanking}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CardRecordeCalendario;
