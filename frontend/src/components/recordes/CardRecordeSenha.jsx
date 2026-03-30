import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { formatarTempoSenha, obterCorPorDigitos } from "../../constants/senha";
import api from "../../services/api";
import "./CardRecorde.css";

const CardRecordeSenha = ({ recorde, usuarioIdVisualizado = null }) => {
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [totalParticipantesRanking, setTotalParticipantesRanking] =
    useState(null);

  const formatarData = (data) => {
    if (!data) return "-";
    try {
      return format(new Date(data), "dd/MM/yy");
    } catch {
      return "-";
    }
  };

  const corDigitos = recorde ? obterCorPorDigitos(recorde.digitos) : "#666";

  const handleIniciarTreino = () => {
    navigate("/treino-senha", {
      state: {
        digitos: recorde.digitos,
        tamanho: recorde.tamanho,
        repeticao: recorde.repeticao,
      },
    });
  };

  const usuarioRankingId =
    usuarioIdVisualizado || (recorde ? recorde.id_usuario : null);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde || !usuarioRankingId) {
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
        return;
      }

      try {
        const params = new URLSearchParams({
          digitos: recorde.digitos.toString(),
          tamanho: recorde.tamanho.toString(),
          repeticao: recorde.repeticao.toString(),
        });
        const response = await api.get(`/senha/rankings?${params.toString()}`);
        const ranking = response.data?.ranking || [];
        const itemUsuario = ranking.find(
          (item) => item.id_usuario === usuarioRankingId,
        );
        setPosicaoRanking(itemUsuario ? itemUsuario.posicao : null);
        setTotalParticipantesRanking(response.data?.totalParticipantes ?? null);
      } catch {
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde, usuarioRankingId]);

  if (!recorde) return null;

  const linkRanking = `/senha?digitos=${recorde.digitos}&tamanho=${recorde.tamanho}&repeticao=${recorde.repeticao}`;
  const dataRecordeFormatada = formatarData(
    recorde.data_recorde || recorde.atualizado_em,
  );

  return (
    <div
      className="card-recorde"
      style={{ borderColor: corDigitos, "--cor-operacao": corDigitos }}
    >
      <div className="card-recorde-header">
        <div className="card-recorde-titulo-linha">
          <button
            className="card-recorde-botao-treino"
            onClick={handleIniciarTreino}
            title="Iniciar treino de senha com esta configuração"
            aria-label="Iniciar treino de senha com esta configuração"
          >
            🏃 Treinar
          </button>
          <h3>{recorde.digitos} dígitos</h3>
        </div>
        <div className="card-recorde-acertos-linha">
          <span className="card-recorde-acertos-texto">
            <strong>Tentativas:</strong>{" "}
            <span
              className="card-recorde-acertos-valor"
              style={{ color: corDigitos }}
            >
              {recorde.total || 0}
            </span>
            <span className="card-recorde-tempo-medio">
              {" "}
              ({formatarTempoSenha(recorde.tempo)})
            </span>
          </span>
        </div>
      </div>

      <div className="card-recorde-info-linha">
        <div className="card-recorde-info-item">
          <span className="card-recorde-info-label">Tamanho</span>
          <span className="card-recorde-info-value">{recorde.tamanho}</span>
        </div>

        {recorde.repeticao === 1 && (
          <div className="card-recorde-info-item">
            <span
              className="card-recorde-info-value"
              style={{
                backgroundColor: "rgba(0, 105, 92, 0.25)",
                color: "#4DB6AC",
                padding: "4px 12px",
                borderRadius: "12px",
                display: "inline-block",
                fontWeight: 600,
                fontSize: "0.85em",
              }}
            >
              Repete
            </span>
          </div>
        )}

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
            <span className="card-recorde-posicao-label">Posição:</span>
            <Link
              to={linkRanking}
              className="card-recorde-posicao-valor card-recorde-posicao-link"
              title="Ver ranking desta configuração de senha"
            >
              #{posicaoRanking}
            </Link>
            <span className="card-recorde-posicao-label">
              {totalParticipantesRanking != null &&
                ` de ${totalParticipantesRanking}`}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardRecordeSenha;
