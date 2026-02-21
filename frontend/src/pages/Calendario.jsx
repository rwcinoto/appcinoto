import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import InfoUsuarioCalendario from "../components/rankings/InfoUsuarioCalendario";
import TabelaRanking from "../components/rankings/TabelaRanking";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Rankings.css";

// Opções de tipo de treino conforme plano (data_geral para todos; ano e seculo para id>=3; dia e mes para id>=4; data_2021 e data_esse_ano para id>=5)
const TIPOS_DISPONIVEIS = [
  { value: "data_geral", label: "Data 1582-2399", planoMin: 2 },
  { value: "dia", label: "Dia", planoMin: 4 },
  { value: "mes", label: "Mês", planoMin: 4 },
  { value: "ano", label: "Ano", planoMin: 3 },
  { value: "seculo", label: "Século", planoMin: 3 },
  { value: "data_esse_ano", label: "Data esse ano", planoMin: 5 },
  { value: "data_2021", label: "Data 1900-2099", planoMin: 5 },
];

const Calendario = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ranking, setRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [limites, setLimites] = useState([]);
  const [conjuntos, setConjuntos] = useState([]);
  const [tipoSelecionado, setTipoSelecionado] = useState("data_geral");
  const [limiteSelecionado, setLimiteSelecionado] = useState("");
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [tempoLimite, setTempoLimite] = useState(null);
  const [erro, setErro] = useState("");
  const tipoInicialAplicadoRef = useRef(false);

  const planoId = usuario?.id_plano || 0;

  const tiposPermitidos = useMemo(() => {
    return TIPOS_DISPONIVEIS.filter((t) => planoId >= t.planoMin);
  }, [planoId]);

  const carregarDados = useCallback(async () => {
    setErro("");
    try {
      const conjuntosUrl =
        usuario?.tipo === "admin" ? "/conjuntos?todos=true" : "/conjuntos";
      const [limitesRes, conjuntosRes] = await Promise.all([
        api.get("/limites"),
        api.get(conjuntosUrl).catch(() => ({ data: [] })),
      ]);
      setLimites(limitesRes.data);
      setConjuntos(conjuntosRes.data || []);
    } catch (error) {
      logError("Calendario - carregarDados", error);
      setErro(getErrorMessage(error));
    }
  }, [usuario?.tipo]);

  const carregarRanking = useCallback(async () => {
    if (!tipoSelecionado || !limiteSelecionado) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setErro("");

    try {
      const params = new URLSearchParams({
        tipo: tipoSelecionado,
        limite_id: limiteSelecionado,
      });
      if (conjuntoSelecionado) {
        params.append("conjunto_id", conjuntoSelecionado);
      }
      const url = `/calendario/rankings?${params.toString()}`;
      const response = await api.get(url);

      setRanking(response.data.ranking || []);
      setPosicaoUsuario(response.data.posicaoUsuario);
      setTotalParticipantes(response.data.totalParticipantes || 0);
      setTempoLimite(response.data.filtros?.limite?.tempo || null);
    } catch (error) {
      logError("Calendario - carregarRanking", error);
      setErro(getErrorMessage(error));
      setRanking([]);
      setPosicaoUsuario(null);
      setTotalParticipantes(0);
      setTempoLimite(null);
    } finally {
      setLoading(false);
    }
  }, [tipoSelecionado, limiteSelecionado, conjuntoSelecionado]);

  useEffect(() => {
    if (usuario) {
      carregarDados();
    }
  }, [usuario, carregarDados]);

  useEffect(() => {
    if (limites.length === 0) return;

    const tipoParam = searchParams.get("tipo");
    const limiteParam = searchParams.get("limite_id");
    const conjuntoIdParam = searchParams.get("conjunto_id");

    if (tipoParam && tiposPermitidos.some((t) => t.value === tipoParam)) {
      // Aplicar o tipo vindo da URL apenas uma vez (primeira carga)
      // Depois disso, respeitar o que o usuário escolher no dropdown
      if (!tipoInicialAplicadoRef.current) {
        setTipoSelecionado(tipoParam);
        tipoInicialAplicadoRef.current = true;
      }
    } else if (tiposPermitidos.length > 0) {
      const tipoAtualInvalido = !tiposPermitidos.some(
        (t) => t.value === tipoSelecionado
      );
      const semTipoNaUrl = !tipoParam;
      // Aplicar favorito só na primeira carga (sem tipo na URL); depois respeitar a escolha do usuário no dropdown
      const deveAplicarPadrao =
        semTipoNaUrl &&
        !tipoInicialAplicadoRef.current &&
        (tipoAtualInvalido || tipoSelecionado === "data_geral");
      if (deveAplicarPadrao) {
        const tipoFavorito = usuario?.calendario_tipo_treino;
        const favoritoPermitido =
          tipoFavorito &&
          tiposPermitidos.some((t) => t.value === tipoFavorito);
        setTipoSelecionado(
          favoritoPermitido ? tipoFavorito : tiposPermitidos[0].value
        );
        tipoInicialAplicadoRef.current = true;
      } else if (tipoAtualInvalido) {
        setTipoSelecionado(tiposPermitidos[0].value);
      }
    }

    if (limiteParam && limites.find((l) => String(l.id) === limiteParam)) {
      setLimiteSelecionado(limiteParam);
    } else if (
      !limiteSelecionado ||
      !limites.find((l) => String(l.id) === limiteSelecionado)
    ) {
      const limitePadrao = limites.find((l) => l.tempo === 60) || limites[0];
      if (limitePadrao) {
        setLimiteSelecionado(String(limitePadrao.id));
      }
    }

    if (
      conjuntoIdParam &&
      conjuntos.find((c) => String(c.id) === conjuntoIdParam)
    ) {
      setConjuntoSelecionado(conjuntoIdParam);
    } else {
      setConjuntoSelecionado("");
    }
  }, [
    limites,
    conjuntos,
    searchParams,
    tiposPermitidos,
    tipoSelecionado,
    limiteSelecionado,
    usuario?.calendario_tipo_treino,
  ]);

  useEffect(() => {
    if (usuario && tipoSelecionado && limiteSelecionado) {
      carregarRanking();
    }
  }, [
    usuario,
    tipoSelecionado,
    limiteSelecionado,
    conjuntoSelecionado,
    carregarRanking,
  ]);

  if (!usuario) {
    return (
      <div className="rankings-container">
        <Loading text="Carregando..." />
      </div>
    );
  }

  return (
    <div className="rankings-container">
      <div className="rankings-header">
        <div className="titulo-com-ajuda">
          <h1>Calendário</h1>
          <button
            className="btn-ajuda"
            onClick={() => navigate("/instrucoes/calendario")}
            title="Ver instruções sobre calendário"
            aria-label="Ver instruções sobre calendário"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </button>
        </div>
        <div className="filtros-header">
          {tiposPermitidos.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Tipo:</span>
              <select
                value={tipoSelecionado}
                onChange={(e) => setTipoSelecionado(e.target.value)}
                className="select-operacao"
              >
                {tiposPermitidos.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          ) : tiposPermitidos.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Tipo:</span>
              <span className="filtro-valor">{tiposPermitidos[0].label}</span>
            </div>
          ) : null}

          {limites.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Limite:</span>
              <select
                value={limiteSelecionado}
                onChange={(e) => setLimiteSelecionado(e.target.value)}
                className="select-limite"
              >
                {limites.map((limite) => (
                  <option key={limite.id} value={limite.id}>
                    {limite.descricao}
                  </option>
                ))}
              </select>
            </div>
          ) : limites.length === 1 ? (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Limite:</span>
              <span className="filtro-valor">{limites[0].descricao}</span>
            </div>
          ) : null}

          {conjuntos.length > 0 && (
            <div className="select-group-filtro">
              <span className="filtro-label">Conjunto:</span>
              <select
                value={conjuntoSelecionado}
                onChange={(e) => setConjuntoSelecionado(e.target.value)}
                className="select-conjunto"
              >
                <option value="">Global</option>
                {conjuntos.map((conjunto) => (
                  <option key={conjunto.id} value={conjunto.id}>
                    {conjunto.nome}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="button"
            className="btn-meus-recordes"
            onClick={() => navigate("/calendario/recordes")}
            title="Ver meus recordes de calendário"
          >
            Meus recordes
          </button>
        </div>
      </div>

      {erro && (
        <ErrorMessage
          message={erro}
          type="error"
          dismissible
          onDismiss={() => setErro("")}
        />
      )}

      {loading ? (
        <Loading text="Carregando ranking..." />
      ) : tipoSelecionado && limiteSelecionado ? (
        <>
          <InfoUsuarioCalendario
            posicaoUsuario={posicaoUsuario}
            totalParticipantes={totalParticipantes}
            ranking={ranking}
            isVisitante={usuario?.isVisitante || false}
            tipo={tipoSelecionado}
            limiteId={limiteSelecionado}
          />

          <TabelaRanking
            ranking={ranking}
            posicaoUsuario={posicaoUsuario}
            tempoLimite={tempoLimite}
            recordesBasePath="/calendario/recordes"
          />
        </>
      ) : (
        <div className="mensagem-aviso">
          <p>Selecione os filtros acima para visualizar o ranking.</p>
        </div>
      )}
    </div>
  );
};

export default Calendario;
