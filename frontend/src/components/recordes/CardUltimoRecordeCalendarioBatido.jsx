import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CHAVE_JANEIRO_PADRAO,
  CHAVE_SECULO_21_PADRAO,
  PERGUNTAR_CHAVES_CALENDARIO,
} from "../../constants/calendario";
import api from "../../services/api";
import { getErrorMessage, logError } from "../../utils/errorHandler";
import ContagemRegressiva from "../treino/ContagemRegressiva";
import ModalOpcoesCalendario from "../treino/ModalOpcoesCalendario";
import "./CardUltimoRecordeBatido.css";

const TIPOS_CALENDARIO_LABEL = {
  data_geral: "Data 1582-2399",
  dia: "Dia",
  mes: "Mês",
  ano: "Ano",
  seculo: "Século",
  data_esse_ano: "Data esse ano",
  data_2021: "Data 1900-2099",
};

const obterCorPorTipoCalendario = (tipo) => {
  const cores = {
    data_geral: "#2196f3", // Azul
    dia: "#4caf50", // Verde
    mes: "#ff9800", // Laranja
    ano: "#ffeb3b", // Amarelo
    seculo: "#f44336", // Vermelho
    data_esse_ano: "#BA68C8", // Roxo claro
    data_2021: "#666", // Cinza
  };
  return cores[tipo] || "#666";
};

const CardUltimoRecordeCalendarioBatido = ({ recorde }) => {
  const navigate = useNavigate();
  const [posicaoRanking, setPosicaoRanking] = useState(null);
  const [totalParticipantesRanking, setTotalParticipantesRanking] =
    useState(null);
  const [iniciandoTreino, setIniciandoTreino] = useState(false);
  const [mostrarContagem, setMostrarContagem] = useState(false);
  const [dadosTreino, setDadosTreino] = useState(null);
  const [mostrarModalOpcoes, setMostrarModalOpcoes] = useState(false);
  const [opcoesParaNavegacao, setOpcoesParaNavegacao] = useState(null);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth <= 768,
  );

  useEffect(() => {
    const mq = window.matchMedia?.("(max-width: 768px)");
    if (!mq) return;
    const atualizar = () => setIsMobile(mq.matches);
    atualizar();
    mq.addEventListener("change", atualizar);
    return () => mq.removeEventListener("change", atualizar);
  }, []);

  useEffect(() => {
    const buscarPosicaoRanking = async () => {
      if (!recorde?.usuario?.id || !recorde?.tipo || !recorde?.limite?.id) {
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
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
        setTotalParticipantesRanking(
          response.data?.totalParticipantes ?? null,
        );
      } catch (error) {
        console.error(
          "Erro ao buscar posição no ranking de calendário:",
          error,
        );
        setPosicaoRanking(null);
        setTotalParticipantesRanking(null);
      }
    };

    buscarPosicaoRanking();
  }, [recorde]);

  if (!recorde) return null;

  const corTipo = obterCorPorTipoCalendario(recorde.tipo);
  const labelTipo = TIPOS_CALENDARIO_LABEL[recorde.tipo] || recorde.tipo;

  const handleIniciarTreino = () => {
    if (!recorde?.tipo || !recorde?.limite) {
      return;
    }
    setMostrarModalOpcoes(true);
  };

  const handleConfirmarOpcoes = async (opcoes) => {
    setMostrarModalOpcoes(false);
    if (!recorde?.tipo || !recorde?.limite) return;

    setIniciandoTreino(true);
    try {
      const tipoResposta = opcoes?.resposta === "nomeDia" ? "texto" : "numeros";
      const chaveSeculo21Base =
        recorde.tipo === "seculo"
          ? PERGUNTAR_CHAVES_CALENDARIO && opcoes?.chaveSeculo21 != null
            ? Number(opcoes.chaveSeculo21)
            : CHAVE_SECULO_21_PADRAO
          : undefined;
      const chaveJaneiroBase =
        recorde.tipo === "mes"
          ? PERGUNTAR_CHAVES_CALENDARIO && opcoes?.chaveJaneiro != null
            ? Number(opcoes.chaveJaneiro)
            : CHAVE_JANEIRO_PADRAO
          : undefined;

      const response = await api.post("/calendario/treinos/iniciar", {
        tipo: recorde.tipo,
        limite_id: recorde.limite.id,
        chaveSeculo21Base,
        chaveJaneiroBase,
      });

      setDadosTreino(response.data);
      setOpcoesParaNavegacao({
        visualizacao: opcoes?.visualizacao || "numeros",
        tipoResposta: opcoes?.resposta != null ? tipoResposta : "numeros",
        chaveSeculo21Base:
          recorde.tipo === "seculo" ? chaveSeculo21Base : undefined,
        chaveJaneiroBase: recorde.tipo === "mes" ? chaveJaneiroBase : undefined,
      });
      setMostrarContagem(true);
    } catch (error) {
      logError(
        "CardUltimoRecordeCalendarioBatido - handleConfirmarOpcoes",
        error,
      );
      alert(getErrorMessage(error));
    } finally {
      setIniciandoTreino(false);
    }
  };

  const handleCancelarOpcoes = () => {
    setMostrarModalOpcoes(false);
  };

  const handleContagemTerminar = () => {
    setMostrarContagem(false);
    setIniciandoTreino(false);
    navigate("/treino-ativo", {
      state: {
        modo: "calendario",
        treinoData: dadosTreino,
        ...(opcoesParaNavegacao || {}),
      },
    });
  };

  const linkRanking =
    recorde?.tipo && recorde?.limite?.id
      ? `/calendario?tipo=${encodeURIComponent(
          recorde.tipo,
        )}&limite_id=${recorde.limite.id}`
      : "/calendario";

  const mostrarOpcoesResposta =
    isMobile &&
    (recorde?.tipo === "data_geral" ||
      recorde?.tipo === "data_2021" ||
      recorde?.tipo === "data_esse_ano");

  return (
    <>
      <ModalOpcoesCalendario
        mostrar={mostrarModalOpcoes}
        mostrarOpcoesResposta={mostrarOpcoesResposta}
        onConfirmar={handleConfirmarOpcoes}
        onCancelar={handleCancelarOpcoes}
        mostrarChaveSeculo21={
          PERGUNTAR_CHAVES_CALENDARIO && recorde?.tipo === "seculo"
        }
        chaveSeculo21Inicial={CHAVE_SECULO_21_PADRAO}
        mostrarChaveJaneiro={
          PERGUNTAR_CHAVES_CALENDARIO && recorde?.tipo === "mes"
        }
        chaveJaneiroInicial={CHAVE_JANEIRO_PADRAO}
      />
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
              Posição:
            </span>
            <Link
              to={linkRanking}
              className="card-ultimo-recorde-batido-posicao-link"
              title="Ver ranking deste tipo de treino de calendário"
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

export default CardUltimoRecordeCalendarioBatido;
