import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import "./CardUltimoRecordeBatido.css";

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

const CardUltimoRecordeCalendarioBatido = ({ recorde }) => {
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde?.usuario?.id || !recorde?.tipo || !recorde?.limite?.id) {
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
          (item) => item.id_usuario === recorde.usuario.id,
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
  }, [recorde]);

  if (!recorde) return null;

  const corTipo = obterCorPorTipoCalendario(recorde.tipo);
  const labelTipo = TIPOS_CALENDARIO_LABEL[recorde.tipo] || recorde.tipo;

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
      setMostrarContagem(true);
    } catch (error) {
      logError(
        "CardUltimoRecordeCalendarioBatido - handleIniciarTreino",
        error,
      );
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

  const linkRanking =
    recorde?.tipo && recorde?.limite?.id
      ? `/calendario?tipo=${encodeURIComponent(
          recorde.tipo,
        )}&limite_id=${recorde.limite.id}`
      : "/calendario";

  return (
    <>
      {mostrarContagem && (
        <ContagemRegressiva onTerminar={handleContagemTerminar} />
      )}
      <div
        className="card-ultimo-recorde-batido"
        style={{ borderColor: corTipo }}
      >
        <div className="card-ultimo-recorde-batido-header">
          <span
            className="card-ultimo-recorde-batido-operacao"
            style={{ color: corTipo }}
          >
            {labelTipo}
          </span>
          <button
            className="card-ultimo-recorde-batido-botao-treino"
            onClick={handleIniciarTreino}
            disabled={iniciandoTreino}
            title="Treinar com estas configurações"
            aria-label="Treinar com estas configurações"
            style={{ borderColor: corTipo }}
          >
            {iniciandoTreino ? "..." : "🏃 Treinar"}
          </button>
        </div>

        <div className="card-ultimo-recorde-batido-usuario">
          <Link
            to={`/calendario/recordes?usuario_id=${recorde.usuario?.id || ""}`}
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
            className="card-ultimo-recorde-batido-total"
            style={{ color: corTipo }}
          >
            {recorde.total ?? 0} acertos
          </span>
        </div>

        {posicaoRanking !== null && recorde.tipo && recorde.limite && (
          <div className="card-ultimo-recorde-batido-posicao">
            <span className="card-ultimo-recorde-batido-posicao-label">
              Posição global:
            </span>
            <Link
              to={linkRanking}
              className="card-ultimo-recorde-batido-posicao-link"
              title="Ver ranking deste tipo de treino de calendário"
            >
              #{posicaoRanking}
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CardUltimoRecordeCalendarioBatido;
