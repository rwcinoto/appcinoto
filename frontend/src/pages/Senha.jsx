import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ErrorMessage from "../components/common/ErrorMessage";
import Loading from "../components/common/Loading";
import InfoUsuarioSenha from "../components/rankings/InfoUsuarioSenha";
import TabelaRanking from "../components/rankings/TabelaRanking";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  DIGITOS_POR_PLANO,
  LABELS_REPETICAO,
  REPETICAO_POR_PLANO,
  TAMANHOS_POR_PLANO,
} from "../constants/senha";
import { getErrorMessage, logError } from "../utils/errorHandler";
import "./Rankings.css";

const Senha = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [ranking, setRanking] = useState([]);
  const [posicaoUsuario, setPosicaoUsuario] = useState(null);
  const [totalParticipantes, setTotalParticipantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [conjuntos, setConjuntos] = useState([]);
  const [digitosSelecionado, setDigitosSelecionado] = useState(6);
  const [tamanhoSelecionado, setTamanhoSelecionado] = useState(4);
  const [repeticaoSelecionado, setRepeticaoSelecionado] = useState(0);
  const [conjuntoSelecionado, setConjuntoSelecionado] = useState("");
  const [filtrosInicializados, setFiltrosInicializados] = useState(false);
  const [erro, setErro] = useState("");
  const inicialAplicadoRef = useRef(false);

  const planoId = usuario?.id_plano || 2;

  const digitosPermitidos = useMemo(
    () => DIGITOS_POR_PLANO[planoId] || DIGITOS_POR_PLANO[2],
    [planoId]
  );
  const tamanhosPermitidos = useMemo(
    () => TAMANHOS_POR_PLANO[planoId] || TAMANHOS_POR_PLANO[2],
    [planoId]
  );
  const repeticaoPermitida = useMemo(
    () => REPETICAO_POR_PLANO[planoId] || REPETICAO_POR_PLANO[2],
    [planoId]
  );

  const carregarConjuntos = useCallback(async () => {
    try {
      const conjuntosUrl =
        usuario?.tipo === "admin" ? "/conjuntos?todos=true" : "/conjuntos";
      const res = await api.get(conjuntosUrl).catch(() => ({ data: [] }));
      setConjuntos(res.data || []);
    } catch (error) {
      logError("Senha - carregarConjuntos", error);
    }
  }, [usuario?.tipo]);

  const carregarRanking = useCallback(async () => {
    setLoading(true);
    setErro("");

    try {
      const params = new URLSearchParams({
        digitos: digitosSelecionado,
        tamanho: tamanhoSelecionado,
        repeticao: repeticaoSelecionado,
      });
      if (conjuntoSelecionado) {
        params.append("conjunto_id", conjuntoSelecionado);
      }
      const url = `/senha/rankings?${params.toString()}`;
      const response = await api.get(url);

      setRanking(response.data.ranking || []);
      setPosicaoUsuario(response.data.posicaoUsuario);
      setTotalParticipantes(response.data.totalParticipantes || 0);
    } catch (error) {
      logError("Senha - carregarRanking", error);
      setErro(getErrorMessage(error));
      setRanking([]);
      setPosicaoUsuario(null);
      setTotalParticipantes(0);
    } finally {
      setLoading(false);
    }
  }, [digitosSelecionado, tamanhoSelecionado, repeticaoSelecionado, conjuntoSelecionado]);

  useEffect(() => {
    if (usuario) {
      carregarConjuntos();
    }
  }, [usuario, carregarConjuntos]);

  useEffect(() => {
    if (inicialAplicadoRef.current) return;
    inicialAplicadoRef.current = true;

    const digitosParam = searchParams.get("digitos");
    const tamanhoParam = searchParams.get("tamanho");
    const repeticaoParam = searchParams.get("repeticao");
    const conjuntoIdParam = searchParams.get("conjunto_id");

    if (digitosParam && digitosPermitidos.includes(Number(digitosParam))) {
      setDigitosSelecionado(Number(digitosParam));
    } else if (
      usuario?.senha_digitos &&
      digitosPermitidos.includes(usuario.senha_digitos)
    ) {
      setDigitosSelecionado(usuario.senha_digitos);
    } else {
      setDigitosSelecionado(digitosPermitidos[0]);
    }

    if (tamanhoParam && tamanhosPermitidos.includes(Number(tamanhoParam))) {
      setTamanhoSelecionado(Number(tamanhoParam));
    } else if (
      usuario?.senha_tamanho &&
      tamanhosPermitidos.includes(usuario.senha_tamanho)
    ) {
      setTamanhoSelecionado(usuario.senha_tamanho);
    } else {
      setTamanhoSelecionado(tamanhosPermitidos.includes(4) ? 4 : tamanhosPermitidos[0]);
    }

    if (repeticaoParam != null && repeticaoPermitida.includes(Number(repeticaoParam))) {
      setRepeticaoSelecionado(Number(repeticaoParam));
    } else if (
      usuario?.senha_repeticao != null &&
      repeticaoPermitida.includes(usuario.senha_repeticao)
    ) {
      setRepeticaoSelecionado(usuario.senha_repeticao);
    } else {
      setRepeticaoSelecionado(0);
    }

    if (conjuntoIdParam) {
      setConjuntoSelecionado(conjuntoIdParam);
    }

    setFiltrosInicializados(true);
  }, [
    searchParams,
    digitosPermitidos,
    tamanhosPermitidos,
    repeticaoPermitida,
    usuario?.senha_digitos,
    usuario?.senha_tamanho,
    usuario?.senha_repeticao,
  ]);

  useEffect(() => {
    if (usuario && filtrosInicializados) {
      carregarRanking();
    }
  }, [
    usuario,
    filtrosInicializados,
    digitosSelecionado,
    tamanhoSelecionado,
    repeticaoSelecionado,
    conjuntoSelecionado,
    carregarRanking,
  ]);

  useEffect(() => {
    if (!digitosPermitidos.includes(digitosSelecionado)) {
      setDigitosSelecionado(digitosPermitidos[0]);
    }
  }, [digitosPermitidos, digitosSelecionado]);

  useEffect(() => {
    if (!tamanhosPermitidos.includes(tamanhoSelecionado)) {
      setTamanhoSelecionado(tamanhosPermitidos.includes(4) ? 4 : tamanhosPermitidos[0]);
    }
  }, [tamanhosPermitidos, tamanhoSelecionado]);

  useEffect(() => {
    if (!repeticaoPermitida.includes(repeticaoSelecionado)) {
      setRepeticaoSelecionado(0);
    }
  }, [repeticaoPermitida, repeticaoSelecionado]);

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
          <h1>Senha</h1>
        </div>
        <div className="filtros-header">
          {digitosPermitidos.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Dígitos:</span>
              <select
                value={digitosSelecionado}
                onChange={(e) => setDigitosSelecionado(Number(e.target.value))}
                className="select-operacao"
              >
                {digitosPermitidos.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Dígitos:</span>
              <span className="filtro-valor">{digitosPermitidos[0]}</span>
            </div>
          )}

          {tamanhosPermitidos.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Tamanho:</span>
              <select
                value={tamanhoSelecionado}
                onChange={(e) => setTamanhoSelecionado(Number(e.target.value))}
                className="select-operacao"
              >
                {tamanhosPermitidos.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Tamanho:</span>
              <span className="filtro-valor">{tamanhosPermitidos[0]}</span>
            </div>
          )}

          {repeticaoPermitida.length > 1 ? (
            <div className="select-group-filtro">
              <span className="filtro-label">Repetição:</span>
              <select
                value={repeticaoSelecionado}
                onChange={(e) => setRepeticaoSelecionado(Number(e.target.value))}
                className="select-operacao"
              >
                {LABELS_REPETICAO.filter((r) =>
                  repeticaoPermitida.includes(r.value)
                ).map((r) => (
                  <option key={r.value} value={r.value}>
                    {r.label}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="filtro-valor-unico">
              <span className="filtro-label">Repetição:</span>
              <span className="filtro-valor">
                {LABELS_REPETICAO.find((r) => r.value === repeticaoPermitida[0])?.label}
              </span>
            </div>
          )}

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
            onClick={() => navigate("/senha/recordes")}
            title="Ver meus recordes de senha"
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
      ) : (
        <>
          <InfoUsuarioSenha
            posicaoUsuario={posicaoUsuario}
            totalParticipantes={totalParticipantes}
            ranking={ranking}
            isVisitante={usuario?.isVisitante || false}
            digitos={digitosSelecionado}
            tamanho={tamanhoSelecionado}
            repeticao={repeticaoSelecionado}
          />

          <TabelaRanking
            ranking={ranking}
            posicaoUsuario={posicaoUsuario}
            recordesBasePath="/senha/recordes"
            tipo="senha"
          />
        </>
      )}
    </div>
  );
};

export default Senha;
