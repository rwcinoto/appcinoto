import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { obterCorPorDigitos } from "../../constants/senha";
import api from "../../services/api";
import "./CardUltimoRecordeBatido.css";

const CardUltimoRecordeSenhaBatido = ({ recorde }) => {
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [totalParticipantesRanking, setTotalParticipantesRanking] =
    useState(null);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde?.usuario?.id) {
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
          (item) => item.id_usuario === recorde.usuario.id,
        );
        setPosicaoRanking(itemUsuario ? itemUsuario.posicao : null);
        setTotalParticipantesRanking(response.data?.totalParticipantes ?? null);
      } catch {
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde]);

  if (!recorde) return null;

  const corDigitos = obterCorPorDigitos(recorde.digitos);
  const linkRanking = `/senha?digitos=${recorde.digitos}&tamanho=${recorde.tamanho}&repeticao=${recorde.repeticao}`;

  const handleIniciarTreino = () => {
    navigate("/treino-senha", {
      state: {
        digitos: recorde.digitos,
        tamanho: recorde.tamanho,
        repeticao: recorde.repeticao,
      },
    });
  };

  return (
    <div
      className="card-ultimo-recorde-batido"
      style={{ borderColor: corDigitos }}
    >
      <div className="card-ultimo-recorde-batido-header">
        <span
          className="card-ultimo-recorde-batido-operacao"
          style={{ color: corDigitos }}
        >
          {recorde.digitos} dígitos
        </span>
        <button
          className="card-ultimo-recorde-batido-botao-treino"
          onClick={handleIniciarTreino}
          title="Treinar com estas configurações"
          aria-label="Treinar com estas configurações"
          style={{ borderColor: corDigitos }}
        >
          🏃 Treinar
        </button>
      </div>

      <div className="card-ultimo-recorde-batido-usuario">
        <Link
          to={`/senha/recordes?usuario_id=${recorde.usuario?.id || ""}`}
          className="card-ultimo-recorde-batido-link-usuario"
        >
          {recorde.usuario?.nome || "-"}
        </Link>
      </div>

      <div className="card-ultimo-recorde-batido-linha">
        <span className="card-ultimo-recorde-batido-limite">
          Tamanho {recorde.tamanho}
        </span>
        {recorde.repeticao === 1 && (
          <>
            <span className="card-ultimo-recorde-batido-separador">•</span>
            <span
              style={{
                backgroundColor: "rgba(0, 105, 92, 0.25)",
                color: "#4DB6AC",
                padding: "2px 10px",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.85em",
              }}
            >
              Repete
            </span>
          </>
        )}
        <span className="card-ultimo-recorde-batido-separador">•</span>
        <span
          className="card-ultimo-recorde-batido-total"
          style={{ color: corDigitos }}
        >
          {recorde.total ?? 0}{" "}
          {recorde.total === 1 ? "tentativa" : "tentativas"}
        </span>
      </div>

      {posicaoRanking !== null && (
        <div className="card-ultimo-recorde-batido-posicao">
          <span className="card-ultimo-recorde-batido-posicao-label">
            Posição:
          </span>
          <Link
            to={linkRanking}
            className="card-ultimo-recorde-batido-posicao-link"
            title="Ver ranking desta configuração de senha"
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
  );
};

export default CardUltimoRecordeSenhaBatido;
